#
#  @FileName : dashboard_repository.py
#  @Description : 관리자 대시보드 통계/최근 활동 전용 DB 모듈
#  @Author : 김다솜
#  @Date : 2026. 05. 12
#  @Modification_History
#  @
#  @ 수정일자        수정자          수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.12    김다솜        database.py 분리를 위한 대시보드 통계 모듈 추가
#

from datetime import datetime

import pandas as pd

from repositories.db_connection import get_connection


def analyze_onboarding_stats():
    """
    부서별 온보딩 완료율 차트 데이터 반환
    """
    conn = get_connection()
    if not conn:
        return []

    try:
        query = """
            SELECT
                d.dept_name as group_name,
                COALESCE(COUNT(ri.item_id), 0) as total_items,
                COALESCE(SUM(CASE WHEN rp.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as completed_items
            FROM department d
            LEFT JOIN employee e ON d.dept_id = e.dept_id
            LEFT JOIN ROADMAP r ON e.emp_no = r.emp_no
            LEFT JOIN ROAD_ITEM ri ON r.roadmap_id = ri.roadmap_id
            LEFT JOIN ROAD_PROGRESS rp ON ri.item_id = rp.item_id AND e.emp_no = rp.emp_no
            GROUP BY d.dept_id, d.dept_name
            ORDER BY group_name
        """
        results = conn.run(query)

        stats = []
        for group_name, total_items, completed_items in results:
            rate = 0.0 if not total_items else round((completed_items / total_items) * 100, 1)
            stats.append({"dept_name": group_name, "completion_rate": rate})
        return stats
    except Exception as e:
        print(f"온보딩 통계 분석 실패: {e}")
        return []


def analyze_quiz_performance():
    """
    부서별 평균 퀴즈 점수 차트 데이터 반환
    """
    conn = get_connection()
    if not conn:
        return []

    try:
        query = """
            SELECT
                d.dept_name,
                COALESCE(AVG(sub.total_score), 0) as avg_score
            FROM department d
            LEFT JOIN employee e ON d.dept_id = e.dept_id
            LEFT JOIN (
                SELECT
                    qr.emp_no,
                    qq.category_name,
                    qr.submitted_at,
                    SUM(COALESCE(qr.score, 0)) as total_score
                FROM QUIZ_RESULT qr
                JOIN QUIZ_QUESTION qq ON qr.question_id = qq.question_id
                WHERE qr.submitted_at IS NOT NULL
                GROUP BY qr.emp_no, qq.category_name, qr.submitted_at
            ) sub ON e.emp_no = sub.emp_no
            GROUP BY d.dept_id, d.dept_name
            ORDER BY d.dept_id
        """
        results = conn.run(query)
        return [
            {"dept_name": row[0], "avg_score": round(float(row[1] or 0), 1)}
            for row in results
        ]
    except Exception as e:
        print(f"퀴즈 통계 분석 실패: {e}")
        return []


def analyze_ai_usage_trend():
    """
    AI_LOG 기준 AI 기능 사용 유형별 건수 집계
    """
    conn = get_connection()
    if not conn:
        return {}

    try:
        query = """
            SELECT
                type,
                COUNT(*) as usage_count
            FROM AI_LOG
            WHERE success = TRUE
            GROUP BY type
        """
        results = conn.run(query)
        return {row[0]: int(row[1]) for row in results}
    except Exception as e:
        print(f"AI 사용 통계 분석 실패: {e}")
        return {}


def analyze_rag_status():
    """
    문서 처리 단계별 건수 차트 데이터 반환
    """
    conn = get_connection()
    if not conn:
        return []

    try:
        query = """
            SELECT
                current_stage,
                COUNT(*) as count
            FROM DOCUMENT
            GROUP BY current_stage
        """
        results = conn.run(query)
        df = pd.DataFrame(results, columns=["stage", "count"])
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"RAG 상태 분석 실패: {e}")
        return []


def analyze_dashboard_kpis():
    """
    관리자 홈 KPI 카드용 요약 수치 계산
    """
    conn = get_connection()
    if not conn:
        return {
            "totalOnboarding": 0,
            "avgProgress": 0.0,
            "evaluationSubmissions": 0,
            "aiActivities": 0,
        }

    try:
        res_total = conn.run("SELECT COUNT(DISTINCT emp_no) FROM ROADMAP")
        total_onboarding = int(res_total[0][0]) if res_total else 0

        query_avg = """
            SELECT
                CAST(COUNT(rp.item_id) AS FLOAT) / NULLIF(COUNT(ri.item_id), 0) * 100 as avg_rate
            FROM ROAD_ITEM ri
            LEFT JOIN ROAD_PROGRESS rp
              ON ri.item_id = rp.item_id
             AND rp.status = 'COMPLETED'
        """
        res_avg = conn.run(query_avg)
        avg_progress = round(float(res_avg[0][0] or 0), 1) if res_avg else 0.0

        query_eval = """
            SELECT COUNT(*)
            FROM (
                SELECT DISTINCT qr.emp_no, qq.category_name, qr.submitted_at
                FROM QUIZ_RESULT qr
                JOIN QUIZ_QUESTION qq ON qr.question_id = qq.question_id
                WHERE qr.submitted_at IS NOT NULL
            ) submitted
        """
        res_eval = conn.run(query_eval)
        evaluation_submissions = int(res_eval[0][0]) if res_eval else 0

        query_ai = """
            SELECT COUNT(*)
            FROM AI_LOG
            WHERE success = TRUE
        """
        res_ai = conn.run(query_ai)
        ai_activities = int(res_ai[0][0]) if res_ai else 0

        return {
            "totalOnboarding": total_onboarding,
            "avgProgress": avg_progress,
            "evaluationSubmissions": evaluation_submissions,
            "aiActivities": ai_activities,
        }
    except Exception as e:
        print(f"KPI 분석 실패: {e}")
        return {
            "totalOnboarding": 0,
            "avgProgress": 0.0,
            "evaluationSubmissions": 0,
            "aiActivities": 0,
        }


def _format_activity_time(event_time):
    """
    최근 활동 상대 시간 문자열 변환
    """
    if event_time is None:
        return "방금 전"

    now = datetime.now()
    delta = now - event_time
    seconds = int(delta.total_seconds())

    if seconds < 60:
        return "방금 전"
    if seconds < 3600:
        return f"{seconds // 60}분 전"
    if seconds < 86400:
        return f"{seconds // 3600}시간 전"
    if seconds < 172800:
        return "어제"
    return event_time.strftime("%m-%d %H:%M")


def analyze_recent_activities(limit=5):
    """
    최근 시스템 활동 목록 통합 반환
    """
    conn = get_connection()
    if not conn:
        return []

    activities = []

    try:
        document_rows = conn.run("""
            SELECT
                d.title,
                l.stage,
                l.status,
                COALESCE(l.ended_at, l.updated_at, l.created_at) as event_time
            FROM DOCUMENT_PROCESS_LOG l
            JOIN DOCUMENT d ON l.doc_id = d.doc_id
            WHERE COALESCE(l.ended_at, l.updated_at, l.created_at) IS NOT NULL
            ORDER BY event_time DESC
            LIMIT 5
        """)

        for title, stage, status, event_time in document_rows:
            stage_label = {"CHUNK": "청크", "EMBED": "벡터", "PUBLISH": "게시"}.get(stage, "문서")
            status_label = "완료" if status == "SUCCESS" else "실패"
            activities.append(
                {
                    "event_time": event_time,
                    "time_label": _format_activity_time(event_time),
                    "title": "문서/RAG",
                    "message": f"{title} 문서의 {stage_label} 처리 {status_label}",
                    "url": "/admin/onboarding/documents",
                    "borderClass": "border-success" if status == "SUCCESS" else "border-danger",
                    "textClass": "text-success" if status == "SUCCESS" else "text-danger",
                }
            )

        quiz_rows = conn.run("""
            SELECT
                e.name,
                qq.category_name,
                qr.submitted_at
            FROM (
                SELECT DISTINCT emp_no, question_id, submitted_at
                FROM QUIZ_RESULT
                WHERE submitted_at IS NOT NULL
            ) qr
            JOIN QUIZ_QUESTION qq ON qr.question_id = qq.question_id
            JOIN employee e ON qr.emp_no = e.emp_no
            ORDER BY qr.submitted_at DESC
            LIMIT 5
        """)

        for name, category_name, event_time in quiz_rows:
            activities.append(
                {
                    "event_time": event_time,
                    "time_label": _format_activity_time(event_time),
                    "title": "온보딩 평가",
                    "message": f"{name}님이 {category_name} 카테고리 평가를 제출했습니다.",
                    "url": "/admin/evaluation/main",
                    "borderClass": "border-primary",
                    "textClass": "text-primary",
                }
            )

        ai_rows = conn.run("""
            SELECT
                COALESCE(e.name, '사용자'),
                a.type,
                a.created_at
            FROM AI_LOG a
            LEFT JOIN employee e ON a.emp_no = e.emp_no
            WHERE a.created_at IS NOT NULL
            ORDER BY a.created_at DESC
            LIMIT 5
        """)

        for name, ai_type, event_time in ai_rows:
            activities.append(
                {
                    "event_time": event_time,
                    "time_label": _format_activity_time(event_time),
                    "title": "AI 비서",
                    "message": f"{name}님이 {ai_type} 기능을 사용했습니다.",
                    "url": "/admin/home",
                    "borderClass": "border-warning",
                    "textClass": "text-warning",
                }
            )

        activities.sort(key=lambda item: item["event_time"] or datetime.min, reverse=True)

        recent = []
        for item in activities[:limit]:
            item.pop("event_time", None)
            recent.append(item)
        return recent
    except Exception as e:
        print(f"최근 활동 분석 실패: {e}")
        return []
