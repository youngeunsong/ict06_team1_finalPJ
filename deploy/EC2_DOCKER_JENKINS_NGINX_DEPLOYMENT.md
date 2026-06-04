# AWS EC2 + Docker + PostgreSQL 18 + Jenkins + Nginx 배포 절차

이 문서는 Windows 개발환경에서 확인한 프로젝트를 Ubuntu EC2 운영환경에 배포하기 위한 절차입니다.

사용 구성:

- AWS EC2 Ubuntu
- Docker / Docker Compose
- PostgreSQL 18
- Redis
- Spring Boot backend
- FastAPI AI server
- React frontend build
- Jenkins
- Nginx
- 기존 서버 DB dump backup SQL 파일

## 1. 권장 배포 구조

```text
사용자 브라우저
  -> EC2 Nginx :80 또는 :443
      /          -> React 정적 파일
      /api       -> Spring Boot container :8081
      /ai-api    -> FastAPI container :8000
      /calendar  -> Spring Boot container :8081
      /attendance-> Spring Boot container :8081
      /leave     -> Spring Boot container :8081

Docker Compose
  backend     Spring Boot
  ai-server   FastAPI
  postgres    PostgreSQL 18
  redis       Redis
```

Nginx만 외부에 공개하고, Spring/FastAPI/PostgreSQL/Redis는 EC2 내부 Docker 네트워크에서만 접근하게 둡니다.

## 2. AWS 보안그룹 설정

EC2 보안그룹 인바운드 규칙:

```text
22    SSH       본인 IP만 허용
80    HTTP      0.0.0.0/0
443   HTTPS     0.0.0.0/0, SSL 적용 시
8080  Jenkins   본인 IP만 허용 또는 VPN/IP 제한
```

열지 않는 포트:

```text
5432  PostgreSQL
6379  Redis
8081  Spring Boot
8000  FastAPI
```

## 3. Windows에서 EC2 접속 준비

Windows 개발 PC에서는 MobaXterm을 사용해 SSH 접속과 파일 업로드를 함께 처리하는 방식이 편합니다.

필요한 정보:

```text
EC2 Public IP 또는 Public DNS
SSH User: ubuntu
Key file: .pem 파일
SSH Port: 22
```

### 3.1 MobaXterm SSH 접속

1. MobaXterm 실행
2. `Session` 클릭
3. `SSH` 선택
4. `Remote host`에 EC2 Public IP 입력
5. `Specify username` 체크 후 `ubuntu` 입력
6. `Advanced SSH settings` 탭 선택
7. `Use private key` 체크 후 `.pem` 키 파일 선택
8. 접속

처음 접속 시 host key 확인 메시지가 나오면 `Accept`를 선택합니다.

접속 후 기본 확인:

```bash
whoami
pwd
uname -a
```

정상이라면 사용자는 `ubuntu`입니다.

### 3.2 MobaXterm SFTP 패널 사용

MobaXterm으로 SSH 접속하면 왼쪽에 SFTP 파일 탐색 패널이 함께 열립니다. 이 패널로 Windows 파일을 EC2에 드래그 앤 드롭할 수 있습니다.

주로 업로드할 파일:

```text
DB dump SQL 파일
배포 테스트용 .env 파일
수동 배포 시 프로젝트 압축 파일
```

권장 업로드 위치:

```text
/home/ubuntu/
```

예를 들어 `backup.sql`을 `/home/ubuntu/backup.sql`로 업로드한 뒤, EC2 터미널에서 `/opt/team1/db/init`로 옮깁니다.

### 3.3 SSH 키 권한 문제

Windows/MobaXterm에서는 보통 `.pem` 권한 문제를 자동 처리합니다. PowerShell `ssh` 또는 `scp`를 직접 쓰는 경우 키 권한 오류가 날 수 있습니다.

PowerShell에서 접속하는 예:

```powershell
ssh -i "D:\keys\team1.pem" ubuntu@EC2_PUBLIC_IP
```

파일 업로드 예:

```powershell
scp -i "D:\keys\team1.pem" D:\backup\backup.sql ubuntu@EC2_PUBLIC_IP:/home/ubuntu/backup.sql
```

MobaXterm을 사용할 수 있다면 대용량 dump 파일 업로드는 SFTP 패널을 쓰는 편이 더 직관적입니다.

## 4. EC2 기본 패키지 설치

```bash
sudo apt update
sudo apt upgrade -y

sudo apt install -y \
  git curl unzip ca-certificates gnupg lsb-release \
  nginx openjdk-17-jdk
```

Java 확인:

```bash
java -version
```

## 5. Docker 설치

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

현재 사용자와 Jenkins 사용자가 Docker를 쓸 수 있게 합니다.

```bash
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl restart docker
```

적용을 위해 SSH 재접속 후 확인:

```bash
docker version
docker compose version
```

## 6. Jenkins 설치

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins

sudo systemctl enable jenkins
sudo systemctl start jenkins
```

초기 비밀번호 확인:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Jenkins 접속:

```text
http://EC2_PUBLIC_IP:8080
```

Jenkins 사용자에게 Docker 권한 부여:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Jenkins에서 사용할 권장 플러그인:

- Git
- Pipeline
- Docker Pipeline
- Credentials Binding

## 7. EC2 디렉터리 준비

```bash
sudo mkdir -p /opt/team1
sudo mkdir -p /opt/team1/env
sudo mkdir -p /opt/team1/uploads
sudo mkdir -p /opt/team1/db/init
sudo mkdir -p /var/www/team1

sudo chown -R ubuntu:ubuntu /opt/team1
sudo chown -R www-data:www-data /var/www/team1
```

## 8. 운영 환경변수 파일 작성

프로젝트의 아래 예시 파일을 참고합니다.

```text
deploy/backend.env.example
deploy/ai.env.example
```

EC2에서 실제 파일 생성:

```bash
sudo nano /opt/team1/env/backend.env
```

예시:

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8081

APP_FRONTEND_ORIGIN=http://EC2_PUBLIC_IP
APP_CORS_ALLOWED_ORIGINS=http://EC2_PUBLIC_IP
AI_SERVER_BASE_URL=http://ai-server:8000

DB_URL=jdbc:postgresql://postgres:5432/ict06_team1_finalpj
DB_USERNAME=postgres
DB_PASSWORD=운영_DB_비밀번호

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=충분히_긴_랜덤_문자열
JWT_EXPIRATION=1800000
JWT_REFRESH_EXPIRATION=1209600000

OPENWEATHER_API_KEY=운영키
HOLIDAY_API_SERVICE_KEY=운영키
GEMINI_API_KEY=운영키
GROQ_API_KEY=운영키
```

AI 서버 환경변수:

```bash
sudo nano /opt/team1/env/ai.env
```

```env
ALLOWED_ORIGINS=http://EC2_PUBLIC_IP

GEMINI_API_KEY=운영키
GROQ_API_KEY=운영키
OPENWEATHER_API_KEY=운영키

OLLAMA_DOC_POSTPROCESS=false
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:8b
```

권한 제한:

```bash
sudo chmod 600 /opt/team1/env/backend.env /opt/team1/env/ai.env
sudo chown root:root /opt/team1/env/backend.env /opt/team1/env/ai.env
```

## 9. Spring properties 파일 준비

현재 저장소는 `application*.properties`가 `.gitignore`에 들어 있습니다. Jenkins 빌드 전에 아래 예시 파일을 실제 리소스 파일로 복사해야 합니다.

```text
deploy/application.properties.example
deploy/application-prod.properties.example
```

Jenkins 빌드 단계에서 수행할 명령:

```bash
cp deploy/application.properties.example src/main/resources/application.properties
cp deploy/application-prod.properties.example src/main/resources/application-prod.properties
```

운영 비밀값은 properties에 직접 쓰지 않고 `/opt/team1/env/backend.env`에서 주입합니다.

## 10. Dockerfile 작성

### 10.1 Backend Dockerfile

프로젝트 루트에 `Dockerfile.backend`를 둡니다.

```dockerfile
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 10.2 AI Server Dockerfile

프로젝트 루트에 `Dockerfile.ai`를 둡니다.

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY ai_server/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_server/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 11. Docker Compose 작성

프로젝트 루트에 `docker-compose.prod.yml`을 둡니다.

```yaml
services:
  postgres:
    image: postgres:18
    container_name: team1-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ict06_team1_finalpj
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      TZ: Asia/Seoul
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - /opt/team1/db/init:/docker-entrypoint-initdb.d
    networks:
      - team1-net

  redis:
    image: redis:7
    container_name: team1-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    networks:
      - team1-net

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: team1-backend
    restart: unless-stopped
    env_file:
      - /opt/team1/env/backend.env
    depends_on:
      - postgres
      - redis
      - ai-server
    volumes:
      - /opt/team1/uploads:/app/uploads
    networks:
      - team1-net
    ports:
      - "127.0.0.1:8081:8081"

  ai-server:
    build:
      context: .
      dockerfile: Dockerfile.ai
    container_name: team1-ai-server
    restart: unless-stopped
    env_file:
      - /opt/team1/env/ai.env
    networks:
      - team1-net
    ports:
      - "127.0.0.1:8000:8000"

networks:
  team1-net:

volumes:
  postgres-data:
  redis-data:
```

Compose에서 `${POSTGRES_PASSWORD}`를 쓰려면 Jenkins 실행 전에 같은 값이 들어 있는 `.env` 파일을 배포 디렉터리에 둡니다.

```bash
sudo nano /opt/team1/.env
```

```env
POSTGRES_PASSWORD=운영_DB_비밀번호
```

권한:

```bash
sudo chmod 600 /opt/team1/.env
sudo chown root:root /opt/team1/.env
```

## 12. PostgreSQL 18 DB 복원

### 12.1 dump SQL 파일 업로드

서버컴퓨터에서 받은 SQL dump 파일을 EC2로 복사합니다. MobaXterm을 쓰는 경우 SFTP 패널에서 드래그 앤 드롭으로 업로드하는 방식을 권장합니다.

MobaXterm 방식:

```text
1. MobaXterm으로 EC2 SSH 접속
2. 왼쪽 SFTP 패널에서 /home/ubuntu 경로로 이동
3. Windows의 backup.sql 파일을 SFTP 패널로 드래그 앤 드롭
4. EC2 터미널에서 파일 확인
```

```bash
ls -lh /home/ubuntu/backup.sql
```

PowerShell `scp` 방식:

Windows PowerShell 예시:

```powershell
scp -i "키파일.pem" D:\backup\backup.sql ubuntu@EC2_PUBLIC_IP:/home/ubuntu/backup.sql
```

EC2에서 init 폴더로 이동:

```bash
sudo cp /home/ubuntu/backup.sql /opt/team1/db/init/01_backup.sql
sudo chown root:root /opt/team1/db/init/01_backup.sql
sudo chmod 644 /opt/team1/db/init/01_backup.sql
```

파일 용량이 큰 경우 업로드 후 체크섬을 비교하면 좋습니다.

Windows PowerShell:

```powershell
Get-FileHash D:\backup\backup.sql -Algorithm SHA256
```

EC2:

```bash
sha256sum /home/ubuntu/backup.sql
```

두 해시값이 같으면 전송이 정상입니다.

### 12.2 최초 기동 시 자동 복원

PostgreSQL Docker 이미지는 데이터 디렉터리가 비어 있을 때 `/docker-entrypoint-initdb.d/*.sql`을 자동 실행합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d postgres
docker logs -f team1-postgres
```

주의:

- `postgres-data` 볼륨이 이미 만들어진 뒤에는 init SQL이 다시 실행되지 않습니다.
- 다시 복원해야 한다면 기존 볼륨 삭제가 필요합니다. 운영 DB 삭제 위험이 있으니 반드시 백업 후 진행합니다.

개발/초기 테스트에서만 볼륨 삭제:

```bash
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml down
docker volume rm current_postgres-data
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d postgres
```

### 12.3 수동 복원 방식

이미 DB 컨테이너가 떠 있다면 수동 복원도 가능합니다.

```bash
docker cp /home/ubuntu/backup.sql team1-postgres:/tmp/backup.sql
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -f /tmp/backup.sql
```

복원 확인:

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "\dt"
```

## 13. Nginx 설정

프로젝트의 예시 파일:

```text
deploy/nginx-team1.conf.example
```

EC2에서 설정:

```bash
sudo nano /etc/nginx/sites-available/team1
```

예시:

```nginx
server {
    listen 80;
    server_name EC2_PUBLIC_IP;

    root /var/www/team1;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ai-api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ ^/(calendar|attendance|leave|test)(/|$) {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

활성화:

```bash
sudo ln -s /etc/nginx/sites-available/team1 /etc/nginx/sites-enabled/team1
sudo nginx -t
sudo systemctl reload nginx
```

기본 사이트가 충돌하면 제거:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 14. Jenkins Pipeline 구성

Jenkins Item:

```text
New Item -> Pipeline -> Pipeline script from SCM
```

권장 Jenkinsfile:

```groovy
pipeline {
    agent any

    environment {
        DEPLOY_DIR = "/opt/team1/current"
        FRONT_DIR = "/var/www/team1"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Spring Properties') {
            steps {
                sh '''
                cp deploy/application.properties.example src/main/resources/application.properties
                cp deploy/application-prod.properties.example src/main/resources/application-prod.properties
                '''
            }
        }

        stage('Build Backend Jar') {
            steps {
                sh './mvnw clean package -DskipTests'
            }
        }

        stage('Build React') {
            steps {
                dir('react-frontend') {
                    sh '''
                    npm ci
                    REACT_APP_SERVER_URL=/api \
                    REACT_APP_AI_SERVER_URL=/ai-api \
                    npm run build
                    '''
                }
            }
        }

        stage('Sync Deploy Files') {
            steps {
                sh '''
                sudo mkdir -p $DEPLOY_DIR
                sudo rsync -a --delete \
                  --exclude .git \
                  --exclude node_modules \
                  --exclude react-frontend/node_modules \
                  --exclude react-frontend/build \
                  --exclude target \
                  ./ $DEPLOY_DIR/

                sudo mkdir -p $DEPLOY_DIR/target
                sudo cp target/*.jar $DEPLOY_DIR/target/
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                sudo rm -rf $FRONT_DIR/*
                sudo cp -r react-frontend/build/* $FRONT_DIR/
                sudo chown -R www-data:www-data $FRONT_DIR
                '''
            }
        }

        stage('Docker Compose Build & Up') {
            steps {
                sh '''
                cd $DEPLOY_DIR
                docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml build
                docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d
                '''
            }
        }

        stage('Reload Nginx') {
            steps {
                sh '''
                sudo nginx -t
                sudo systemctl reload nginx
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                sleep 10
                curl -f http://127.0.0.1:8081 || true
                curl -f http://127.0.0.1:8000/health
                curl -f http://127.0.0.1/
                '''
            }
        }
    }
}
```

Jenkins 사용자가 `sudo`로 필요한 작업만 할 수 있게 제한합니다.

```bash
sudo visudo
```

추가:

```text
jenkins ALL=(ALL) NOPASSWD: /usr/bin/mkdir, /usr/bin/rsync, /usr/bin/cp, /usr/bin/rm, /usr/bin/chown, /usr/sbin/nginx, /bin/systemctl reload nginx
```

## 15. 최초 수동 배포 테스트

Jenkins 자동화 전, EC2에서 한 번 수동으로 확인합니다.

```bash
cd /opt/team1/current

cp deploy/application.properties.example src/main/resources/application.properties
cp deploy/application-prod.properties.example src/main/resources/application-prod.properties

./mvnw clean package -DskipTests

cd react-frontend
npm ci
REACT_APP_SERVER_URL=/api REACT_APP_AI_SERVER_URL=/ai-api npm run build
cd ..

sudo rm -rf /var/www/team1/*
sudo cp -r react-frontend/build/* /var/www/team1/
sudo chown -R www-data:www-data /var/www/team1

docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml build
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d
```

컨테이너 확인:

```bash
docker ps
docker logs -f team1-backend
docker logs -f team1-ai-server
docker logs -f team1-postgres
```

## 16. 배포 후 확인 URL

```text
React
http://EC2_PUBLIC_IP

Spring API
http://EC2_PUBLIC_IP/api/auth/login

AI health through Nginx
http://EC2_PUBLIC_IP/ai-api/health

AI health direct local on EC2
curl http://127.0.0.1:8000/health
```

로그인 요청이 정상이라면 브라우저 개발자도구 Network에서 요청 주소가 다음처럼 보여야 합니다.

```text
POST http://EC2_PUBLIC_IP/api/auth/login
```

아래처럼 보이면 React 빌드 환경변수 또는 Nginx 경로 설정이 잘못된 것입니다.

```text
POST http://EC2_PUBLIC_IP:3000/api/auth/login
POST http://localhost:3000/api/auth/login
```

## 17. 운영 명령 모음

서비스 재시작:

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml restart
```

서비스 중지:

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml down
```

이미지 재빌드:

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml build --no-cache
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d
```

로그:

```bash
docker logs -f team1-backend
docker logs -f team1-ai-server
docker logs -f team1-postgres
docker logs -f team1-redis
```

Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 18. DB 백업

운영 DB 백업:

```bash
mkdir -p /opt/team1/backups

docker exec team1-postgres pg_dump \
  -U postgres \
  -d ict06_team1_finalpj \
  > /opt/team1/backups/ict06_team1_finalpj_$(date +%Y%m%d_%H%M%S).sql
```

백업 파일 확인:

```bash
ls -lh /opt/team1/backups
```

## 19. 자주 나는 문제

### React가 `/api`를 React 서버로 보내는 경우

운영 빌드는 다음 값으로 빌드해야 합니다.

```bash
REACT_APP_SERVER_URL=/api
REACT_APP_AI_SERVER_URL=/ai-api
```

개발환경의 `http://localhost:8081/api` 값을 운영 빌드에 넣지 않습니다.

### CORS 오류

`/opt/team1/env/backend.env`:

```env
APP_FRONTEND_ORIGIN=http://EC2_PUBLIC_IP
APP_CORS_ALLOWED_ORIGINS=http://EC2_PUBLIC_IP
```

`/opt/team1/env/ai.env`:

```env
ALLOWED_ORIGINS=http://EC2_PUBLIC_IP
```

변경 후:

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml restart backend ai-server
```

### Spring이 DB에 연결하지 못하는 경우

Docker Compose 내부에서는 DB host가 `localhost`가 아닙니다.

정상:

```env
DB_URL=jdbc:postgresql://postgres:5432/ict06_team1_finalpj
```

잘못된 예:

```env
DB_URL=jdbc:postgresql://localhost:5432/ict06_team1_finalpj
```

### AI 서버를 Spring이 못 찾는 경우

Docker Compose 내부에서는 AI host가 `localhost`가 아닙니다.

정상:

```env
AI_SERVER_BASE_URL=http://ai-server:8000
```

### PostgreSQL init SQL이 다시 실행되지 않는 경우

`/docker-entrypoint-initdb.d`는 PostgreSQL 데이터 볼륨이 처음 생성될 때만 실행됩니다. 이미 볼륨이 있으면 수동 복원을 사용합니다.

```bash
docker cp backup.sql team1-postgres:/tmp/backup.sql
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -f /tmp/backup.sql
```

## 20. 최종 배포 순서 요약

```text
1. EC2 보안그룹 설정
2. Ubuntu 패키지, Docker, Jenkins, Nginx 설치
3. /opt/team1 디렉터리 준비
4. backend.env, ai.env, .env 작성
5. DB dump SQL 업로드
6. Dockerfile.backend, Dockerfile.ai, docker-compose.prod.yml 준비
7. Nginx sites-available/team1 설정
8. Jenkins Pipeline 등록
9. Jenkins 빌드 실행
10. PostgreSQL 복원 확인
11. Docker 컨테이너 상태 확인
12. Nginx reload
13. 브라우저에서 http://EC2_PUBLIC_IP 접속 및 로그인 테스트
14. 운영 DB 백업 스케줄 등록
```
