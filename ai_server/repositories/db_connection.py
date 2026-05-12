#
#  @FileName : db_connection.py
#  @Description : AI 서버 공통 DB 연결 모듈
#  @Author : 김다솜
#  @Date : 2026. 05. 12
#  @Modification_History
#  @
#  @ 수정일자        수정자          수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.12    김다솜        database.py 분리를 위한 공통 연결 모듈 추가
#

import pg8000.native

# PostgreSQL 연결 정보
db_config = {
    "host": "192.168.0.13",
    "port": 5432,
    "database": "ict06_team1_finalpj",
    "user": "postgres",
    "password": "postgre",
}

conn = None


def get_connection():
    """
    전역 연결 객체 재사용용 PostgreSQL 연결 반환
    """
    global conn
    try:
        if conn is None:
            conn = pg8000.native.Connection(**db_config)
        return conn
    except Exception as e:
        print(f"연결 실패: {e}")
        return None
