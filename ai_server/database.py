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
    if conn:
        try:
            # JOIN 쿼리 (테이블명/컬럼명은 다솜님 DB에 맞춰져 있는지 꼭 확인!)
            query = f"""
                SELECT 
                    e.name, 
                    d.dept_name, 
                    p.position_name 
                FROM employee e
                JOIN department d ON e.dept_id = d.dept_id
                JOIN position p ON e.position_id = p.position_id
                WHERE e.emp_no = '{emp_no}'
            """
            result = conn.run(query)
            
            if not result:
                print(f"⚠️ 사원번호 {emp_no}에 해당하는 데이터가 없습니다.")
                return None
                
            columns = [col['name'] for col in conn.columns]
            df = pd.DataFrame(result, columns=columns)
            return df.to_dict('records')[0] 
        except Exception as e:
            print(f"❌ 사원 정보 조회 중 에러 발생: {e}")
            return None
    return None

# 4. 테스트 실행부
if __name__ == "__main__":
    test_emp_no = "20209999" # 여기에 실제 사번 하나 넣어서 테스트해보세요!
    info = fetch_employee_info(test_emp_no)
    if info:
        print("✅ 조회 성공:", info)
    else:
        print("❌ 조회 실패")