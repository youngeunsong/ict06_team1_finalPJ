#
#  @FileName : database.py
#  @Description : 인사평가 > AI 온보딩 로드맵 데이터 처리 모듈
#                 (사원 정보 조회, 콘텐츠 목록 조회, 로드맵 생성 및 저장)
#  @Author : 김다솜
#  @Date : 2026. 04. 28
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.04.27    김다솜        최초 생성/AI 로드맵 추천을 위한 DB 조회 및 저장 함수 구현
#  @ 2026.04.28    김다솜        교육 그룹 기반 로드맵 저장 구조로 수정/ON_CONTENT 메타데이터 조회 컬럼 확장
#

import pg8000.native
import pandas as pd

# 1. DB 설정
db_config = {
    "host": "192.168.0.13",
    "port": 5432,
    "database": "ict06_team1_finalpj",
    "user": "postgres",
    "password": "postgre"
}

# 2. 연결 함수
def get_connection():
    try:
        conn = pg8000.native.Connection(
            host=db_config["host"],
            port=db_config["port"],
            database=db_config["database"],
            user=db_config["user"],
            password=db_config["password"]
        )
        return conn
    except Exception as e:
        print(f"❌ 연결 실패: {e}")
        return None

# 3. 사원 정보 조회 함수 (JOIN 쿼리)
def fetch_employee_info(emp_no):
    conn = get_connection()
    print("조회 emp_no:",emp_no);
    print("DB 설정:",db_config);

    if conn:
        try:
            # JOIN 쿼리
            query = f"""
                SELECT 
                    e.name, 
                    d.dept_name, 
                    p.position_name,
                    e.dept_id,
                    e.position_id
                FROM employee e
                JOIN department d ON e.dept_id = d.dept_id
                JOIN position p ON e.position_id = p.position_id
                WHERE e.emp_no = :emp_no
            """
            result = conn.run(query, emp_no=emp_no)
            
            if not result:
                print(f"⚠️ 사원번호 {emp_no}에 해당하는 데이터가 없습니다.")
                return None
            
            row = result[0]
            return {
                "name": row[0],
                "dept_name": row[1],
                "position_name": row[2],
                "dept_id": row[3],
                "position_id": row[4],
            }
        except Exception as e:
            print(f"❌ 사원 정보 조회 중 에러 발생: {e}")
            return None
    return None

# 4. 이미 저장된 로드맵이 있는지 확인
def fetch_existing_roadmap(emp_no):
    conn = get_connection()
    if not conn:
        return None
    try:
        # 사번으로 로드맵 찾고, 로드맵에 속한 아이템(강의)들 순서대로 가져오기
        query = """
            SELECT
                i.category_name,
                i.item_id,
                i.item_title,
                i.content_id,
                COALESCE(p.status, 'NOT_STARTED') AS status,
                COALESCE(p.rate, 0) AS rate,
                i.order_no
            FROM ROADMAP r
            JOIN ROAD_ITEM i ON r.roadmap_id = i.roadmap_id
            LEFT JOIN ROAD_PROGRESS p
                ON p.item_id = i.item_id
            AND p.emp_no = :emp_no
            WHERE r.emp_no = :emp_no
            ORDER BY i.order_no
        """

        result = conn.run(query, emp_no=emp_no)

        if not result:
            return None
        
        grouped = {}

        for row in result:
            category_name = row[0]

            if category_name not in grouped:
                grouped[category_name] = []
            
            grouped[category_name].append({
                "item_id": row[1],
                "item_title": row[2],
                "content_id": row[3],
                "status": row[4],
                "rate": float(row[5] or 0)
            })

        # 리액트 사용을 위해 json 형태로 변환
        return [
            {
                "category_name":category,
                "items": items
            }
            for category, items in grouped.items()
        ]

    except Exception as e:
        print(f"❌ 기존 로드맵 조회 실패: {e}")
        return None

# 5. AI 로드맵 저장 함수
def save_ai_roadmap(dept_id, position_id, title, roadmap_items, emp_no):
    conn = get_connection()
    if not conn:
        return False

    try:
        # 1) ROADMAP 부모 테이블 저장
        sql_roadmap = """
            INSERT INTO ROADMAP (
                title, dept_id, position_id, emp_no,
                generated_type, version, is_completed, created_at, updated_at
            )
            VALUES (
                :title, :dept_id, :position_id, :emp_no,
                'AI', 1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING roadmap_id
        """

        res = conn.run(
            sql_roadmap, title=title, dept_id=dept_id,
            position_id=position_id, emp_no=emp_no
        )
        
        roadmap_id = res[0][0]

        sql_item = """
            INSERT INTO ROAD_ITEM(
                roadmap_id, content_id, item_title, category_name, order_no
            )
            VALUES(
                :roadmap_id, :content_id, :item_title, :category_name, :order_no
            )
        """
        order_no = 1
        
        # 2) ROAD_ITEM 자식 테이블 저장(3단계 반복)
        for group in roadmap_items:
            category_name = group["category_name"]

            for item in group["items"]:
                conn.run(
                    sql_item,
                    roadmap_id=roadmap_id,
                    content_id=item["content_id"],
                    item_title=item["item_title"],
                    category_name=category_name,
                    order_no=order_no
                )
                order_no += 1

        print(f"DB 저장 완료: 사번{emp_no}, 로드맵 ID={roadmap_id}")
        return True

    except Exception as e:
        print(f"로드맵 저장 실패: {e}")
        return False

# 6. AI에게 줄 강의 목록 텍스트 생성 함수
def get_on_content_list():
    conn = get_connection()
    if not conn:
        return ""
    try:
        query = """
            SELECT
                content_id, title, type, category, sub_category,
                target_position, difficulty, estimated_time, tags, is_mandatory
            FROM ON_CONTENT
            ORDER BY content_id
        """

        results = conn.run(query)

        content_items = []
        for r in results:
            content_items.append(
                f"ID:{r[0]} | "
                f"제목:{r[1]} | "
                f"유형:{r[2]} | "
                f"분류:{r[3]} | "
                f"세부분류:{r[4]} | "
                f"대상직급:{r[5]} | "
                f"난이도:{r[6]} | "
                f"예상학습시간:{r[7]}분 | "
                f"태그:{r[8]} | "
                f"필수여부:{r[9]} | "
            )
        return "\n".join(content_items)

    except Exception as e:
        print(f"콘텐츠 목록 조회 실패: {e}")
        return ""

# 7. 콘텐츠 상세 조회 함수
def fetch_content_detail(content_id):
    conn = get_connection()
    if not conn:
        return None

    try:
        query = """
            SELECT
                content_id, title, type, category, sub_category,
                target_position, difficulty, estimated_time, tags, is_mandatory, path
            FROM ON_CONTENT
            WHERE content_id = :content_id
        """

        # 파라미터 바인딩으로 SQL 실행
        result = conn.run(query, content_id=int(content_id))

        if not result:
            return None

        row = result[0]
        # DB 결과를 JSON 형태로 변환
        return {
            "content_id": row[0],
            "title": row[1],
            "type": row[2],
            "category": row[3],
            "sub_category": row[4],
            "target_position": row[5],
            "difficulty": row[6],
            "estimated_time": row[7],
            "tags": row[8],
            "is_mandatory": row[9],
            "path": row[10],
        }

    except Exception as e:
        print(f"콘텐츠 상세 조회 실패: {e}")
        return None

# 테스트 실행부
if __name__ == "__main__":
    test_emp_no = "20209999" # 추후 수정
    info = fetch_employee_info(test_emp_no)
    if info:
        print("✅ 조회 성공:", info)
        # 로드맵 저장 테스트 (AI가 준 샘플 데이터라고 가정)
        # test_steps = ["기초 교육", "실무 투입", "최종 평가"]
        # save_ai_roadmap(info['dept_id'], info['position_id'], "테스트 로드맵", test_steps)
    else:
        print("❌ 조회 실패")