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
      /           -> React 정적 파일
      /api        -> Spring Boot container :8081
      /ai-api     -> FastAPI container :8000
      /calendar   -> Spring Boot container :8081
      /attendance -> Spring Boot container :8081
      /leave      -> Spring Boot container :8081

Docker Compose
  backend     Spring Boot
  ai-server   FastAPI
  postgres    PostgreSQL 18
  redis       Redis
```

Nginx만 외부에 공개하고, Spring/FastAPI/PostgreSQL/Redis는 EC2 내부 Docker 네트워크에서만 접근하게 둡니다.

## 2. AWS 설정

### 2.1 AWS에서 인스턴스 생성 & 설정

1. https://aws.amazon.com/ko/ 에 접속 -> 프리티어로 회원가입
1. 루트 사용자로 로그인
1. '검색' 탭에서 'EC2' 검색
1. 사이트 상단에 선택된 지역이 '아시아 태평양(서울)'인지 확인. 아니라면 수정 필요.
1. '인스턴스' 시작 클릭
1. '이름' 란에 인스턴스 이름 입력
1. '애플리케이션 및 OS 이미지' - 'Quick Start' - 'Ubuntu' 선택
1. '인스턴스 유형' -> 't3.micro' 선택
1. '키 페어(로그인)' - '새 키 페어 생성' 클릭
1. '키 페어 생성': 아래 항목 입력/선택 후 '키 페어 생성' 클릭, 파일 다운로드.

    - '키 페어 이름' 입력
    - '키 페어 유형' - 'RSA' 선택
    - '프라이빗 키 파일 형식' - '.pem' 선택

1. '스토리지 구성' - 30 GiB, gp3 로 설정 (프리 티어 최대 허용 용량. 추후 용량 추가 예정.)
1. '인스턴스 시작' 클릭

### 2.2 AWS 보안그룹 설정

1. 사이드바 - '네트워크 및 보안' - '보안 그룹' 선택
1. '보안 그룹 생성' 클릭
1. '보안 그룹 이름', '설명(영어로만 작성 가능)' 작성
1. '인바운드 규칙'에서 '규칙 추가' 클릭
1. 아래대로 입력하며 총 4개의 규칙 생성 -> '보안 그룹 생성' 클릭

    ```text
    포트 범위   유형      소스          CIDR 블록 
    22          SSH       내 IP 
    80          HTTP      사용자 지정   0.0.0.0/0
    443         HTTPS     사용자 지정   0.0.0.0/0, SSL 적용 시
    8080        Jenkins   내 IP (본인 IP만 허용 또는 VPN/IP 제한)
    ```

    열지 않는 포트:

    ```text
    5432  PostgreSQL
    6379  Redis
    8081  Spring Boot
    8000  FastAPI
    ```

    Jenkins 포트를 9090 등으로 바꾼 경우 보안그룹도 해당 포트로 맞춥니다.

1. 사이드바 - 인스턴스 - 인스턴스 - 생성했던 인스턴스의 인스턴스 ID 항목 클릭
1. 작업 - 보안 - 보안 그룹 변경 클릭
1. 연결된 보안 그룹 - 보안 그룹 선택 - 방금 생성한 보안 그룹 선택 - 보안 그룹 추가 클릭 - 저장

### 2.3 탄력적 IP 설정

1. 사이드바 - 네트워크 및 보안 - 탄력적 IP 클릭
1. '탄력적 IP 주소 할당' 버튼 클릭
1. 네트워크 경계 그룹: ap-northeast-2 처럼 서울 지역 포함하는 그룹이어야 함. 만약 이 값이 아니라면 사이트 상단에 선택된 지역이 '아시아 태평양(서울)'이 아닌 것이므로 수정 필요.
1. '할당' 클릭
1. 사이드바 - 인스턴스 - 인스턴스 - 생성했던 인스턴스의 인스턴스 ID 항목 클릭
1. 작업 - 네트워킹 - 탄력적 IP 주소 연결 클릭
1. 다음과 같이 설정:

    - 리소스 유형: 인스턴스
    - 인스턴스 : 생성한 인스턴스로 선택

1. 연결 클릭
1. 인스턴스 세부 정보에서 이제 탄력적 IP 주소 확인 가능. 이 주소가 바로 **앞으로 개발한 사이트로 접속할 수 있는 ip 주소**.  

## 3. Windows에서 EC2 접속 준비

Windows 개발 PC에서는 MobaXterm을 사용해 SSH 접속과 파일 업로드를 함께 처리하는 방식이 편합니다.

필요한 정보:

```text
EC2 Public IP 또는 Public DNS
SSH User: ubuntu
Key file: .pem 파일
SSH Port: 22
```

- 깃허브에서 배포용 브랜치로 pull 한 상태로 진행.
- 배포 전 윈도우에서 프로젝트 정상 작동하는 지 확인하고 싶은 경우 '시스템 환경 변수 편집' 기능을 이용해 아래 두 변수를 새로 등록해주세요:
  - REACT_APP_SERVER_URL
    - 변수명: REACT_APP_SERVER_URL
    - 변수 값: http://localhost:8081/api
  - REACT_APP_AI_SERVER_URL
    - 변수명: REACT_APP_AI_SERVER_URL
    - 변수 값: http://localhost:8000/api

### 3.1 MobaXterm SSH 접속

1. MobaXterm 실행
2. `Session` 클릭
3. `SSH` 선택
4. `Remote host`에 EC2 Public IP 입력
5. `Specify username` 체크 후 `ubuntu` 입력
6. `Advanced SSH settings` 탭 선택
7. `Use private key` 체크 후 `.pem` 키 파일 선택
8. 접속

접속 후 기본 확인:

```bash
whoami
pwd
uname -a
```

정상이라면 사용자는 `ubuntu`입니다.

### 3.2 MobaXterm SFTP 패널 사용(참고)

MobaXterm으로 SSH 접속하면 왼쪽에 SFTP 파일 탐색 패널이 함께 열립니다. 이 패널로 Windows 파일을 EC2에 드래그 앤 드롭할 수 있습니다.

권장 업로드 위치:

```text
/home/ubuntu/
```

예를 들어 `backup.sql`을 `/home/ubuntu/backup.sql`로 업로드한 뒤, EC2 터미널에서 `/opt/team1/db/init`로 옮깁니다.

### 3.3 PowerShell SSH/SCP 대체 명령(참고)

```powershell
ssh -i "D:\keys\team1.pem" ubuntu@EC2_PUBLIC_IP
scp -i "D:\keys\team1.pem" D:\backup\backup.sql ubuntu@EC2_PUBLIC_IP:/home/ubuntu/backup.sql
```

MobaXterm을 사용할 수 있다면 대용량 dump 파일 업로드는 SFTP 패널을 쓰는 편이 더 직관적입니다.

## 4. EC2 기본 패키지 설치

프로젝트 빌드는 JDK 17 기준이므로 JDK 17을 설치합니다.

```bash
sudo apt update
sudo apt upgrade -y

sudo apt install -y \
  git curl wget unzip ca-certificates gnupg lsb-release rsync \
  nginx fontconfig openjdk-17-jdk
```

Java 17 확인:

```bash
/usr/lib/jvm/java-17-openjdk-amd64/bin/java -version
/usr/lib/jvm/java-17-openjdk-amd64/bin/javac -version
```

Jenkins 2.555.x는 Jenkins 자체 실행에 Java 21이 필요합니다. 프로젝트 빌드 JDK 17과 Jenkins 실행 Java 21은 분리해서 사용합니다.

React build를 위해 Node.js/npm도 필요합니다. Ubuntu 기본 저장소 버전이 너무 낮으면 NodeSource 또는 nvm을 사용하고, 우선 아래 명령으로 설치 여부를 확인합니다.

```bash
node -v
npm -v
```

없다면 설치합니다.

```bash
sudo apt install -y nodejs npm
node -v
npm -v
```

## 5. Docker 설치

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

printf '%s\n' \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
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

그룹 권한 반영을 위해 SSH를 재접속한 뒤 확인합니다.

```bash
docker version
docker compose version
```

## 6. Jenkins 설치

Jenkins 자체 실행용 Java 21 JRE를 설치합니다.

```bash
sudo apt install -y openjdk-21-jre
```

Jenkins 저장소 키와 apt source를 등록합니다. Jenkins 저장소 키는 `jenkins.io-2026.key`를 사용합니다.

```bash
sudo mkdir -p /etc/apt/keyrings

sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

printf '%s\n' \
  "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins
```

Jenkins가 Java 21로 실행되도록 systemd drop-in 파일을 작성합니다.

```bash
sudo mkdir -p /etc/systemd/system/jenkins.service.d
sudo nano /etc/systemd/system/jenkins.service.d/override.conf
```

아래 내용을 넣습니다.

```ini
[Service]
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="JENKINS_JAVA_CMD=/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
```

저장 확인:

```bash
sudo cat /etc/systemd/system/jenkins.service.d/override.conf
```

Jenkins 시작:

```bash
sudo systemctl daemon-reload
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins --no-pager -l
```

초기 비밀번호 확인:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Jenkins 접속:

```text
http://EC2_PUBLIC_IP:8080
```

초기 화면에서는 `Install suggested plugins`를 선택합니다. 설치 후 아래 플러그인이 있는지 확인하고, 없으면 추가 설치합니다.

```text
Git
Pipeline
Docker Pipeline
Credentials Binding
```

Jenkins 사용자에게 Docker 권한을 부여합니다.

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 6.1 Jenkins 8080 포트 충돌 해결(참고)

Jenkins 시작 로그에 아래 메시지가 나오면 8080 포트를 이미 다른 프로세스가 사용 중입니다.

```text
java.net.BindException: Address already in use
Failed to bind to 0.0.0.0/0.0.0.0:8080
```

포트 사용 프로세스 확인:

```bash
sudo ss -ltnp | grep ':8080'
sudo lsof -i :8080
```

이전에 root로 직접 실행된 Jenkins 프로세스가 잡히는 경우가 있습니다.

```bash
ps -fp PID
sudo tr '\0' ' ' < /proc/PID/cmdline
echo
```

`jenkins.war`가 보이면 종료 후 systemd Jenkins를 다시 시작합니다.

```bash
sudo kill PID
sudo ss -ltnp | grep ':8080'
sudo systemctl reset-failed jenkins
sudo systemctl restart jenkins
sudo systemctl status jenkins --no-pager -l
```

8080을 다른 서비스가 계속 사용해야 한다면 `override.conf`에 포트를 추가합니다.

```ini
[Service]
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="JENKINS_JAVA_CMD=/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
Environment="JENKINS_PORT=9090"
```

이 경우 접속 주소는 `http://EC2_PUBLIC_IP:9090`입니다.

## 7. EC2 디렉터리 준비

```bash
sudo mkdir -p /opt/team1
sudo mkdir -p /opt/team1/env
sudo mkdir -p /opt/team1/uploads/ict_06_uploads
sudo mkdir -p /opt/team1/uploads/employee
sudo mkdir -p /opt/team1/db/init
sudo mkdir -p /var/www/team1

sudo chown -R ubuntu:ubuntu /opt/team1
sudo chown -R www-data:www-data /var/www/team1
```

Git에 올리지 않는 업로드 파일은 EC2 호스트의 `/opt/team1/uploads` 아래에 보관합니다. backend 컨테이너를 재생성해도 이 디렉터리는 유지됩니다.

```text
/opt/team1/uploads/ict_06_uploads  -> 컨테이너 /app/ict_06_uploads
/opt/team1/uploads/employee        -> 컨테이너 /app/employee
```

Windows 개발환경의 프로젝트 루트에 있던 아래 폴더는 MobaXterm SFTP로 업로드해 위 경로에 맞춥니다.

```text
Windows: \ict06_team1_finalPJ\ict_06_uploads  -> EC2: /opt/team1/uploads/ict_06_uploads
Windows: \ict06_team1_finalPJ\employee        -> EC2: /opt/team1/uploads/employee
```

## 8. 운영 환경변수 파일 작성

프로젝트의 아래 예시 파일을 참고합니다.

```text
deploy/backend.env.example
deploy/ai.env.example
```

EC2에서 실제 파일을 생성합니다.

```bash
sudo nano /opt/team1/env/backend.env
```

예시:

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8081

APP_FRONTEND_ORIGIN=https://43.200.198.243.sslip.io
APP_CORS_ALLOWED_ORIGINS=https://43.200.198.243.sslip.io
APP_FRONTEND_LOGIN_URL=https://43.200.198.243.sslip.io/auth/login
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

`APP_FRONTEND_ORIGIN`, `APP_CORS_ALLOWED_ORIGINS`, `APP_FRONTEND_LOGIN_URL`은 실제 브라우저 접속 주소와 정확히 일치해야 합니다. HTTPS를 적용한 뒤에도 이 값이 `http://EC2_PUBLIC_IP`, `corework.duckdns.org`, `YOUR_DOMAIN` 등으로 남아 있으면 로그인 API가 403으로 실패할 수 있습니다.

AI 서버 환경변수:

```bash
sudo nano /opt/team1/env/ai.env
```

```env
ALLOWED_ORIGINS=https://43.200.198.243.sslip.io

GEMINI_API_KEY=운영키
GROQ_API_KEY=운영키
OPENWEATHER_API_KEY=운영키

OLLAMA_DOC_POSTPROCESS=false
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:8b
```

권한 제한:

```bash
sudo chown root:docker /opt/team1/env/backend.env /opt/team1/env/ai.env
sudo chmod 640 /opt/team1/env/backend.env /opt/team1/env/ai.env
```

## 9. 배포용 브랜치 확인 및 전환

EC2에 받아온 프로젝트 브랜치에 `deploy/` 폴더나 Docker/Jenkins/Nginx 배포용 파일이 없으면 이후 명령이 실패합니다.

예를 들어 아래 오류는 현재 체크아웃된 브랜치에 `deploy/application.properties.example` 파일이 없을 때 발생합니다.

```bash
cp: cannot stat 'deploy/application.properties.example': No such file or directory
```

먼저 현재 브랜치와 파일 존재 여부를 확인합니다.

```bash
cd ~/ict06_team1_finalPJ

git branch --show-current
ls deploy
```

`deploy/` 폴더가 없다면 배포용 파일이 들어 있는 브랜치로 전환해야 합니다. 아래 브랜치명은 예시입니다. 실제로는 팀에서 배포 테스트용 파일을 넣어둔 브랜치명을 사용합니다.

```bash
git fetch --all --prune
git switch 배포용_브랜치명
```

예시:

```bash
git switch topic/aws_test
```

원격 브랜치만 있고 로컬 브랜치가 아직 없다면 다음처럼 전환합니다.

```bash
git switch -c 배포용_브랜치명 origin/배포용_브랜치명
```

전환 후 다시 확인합니다.

```bash
git branch --show-current
ls deploy
ls deploy/application.properties.example deploy/application-prod.properties.example
```

Jenkins Pipeline 사용 시에도 같은 원칙을 적용합니다. Jenkins job의 SCM 설정에서 배포용 파일이 포함된 브랜치를 지정하거나, Pipeline에서 해당 브랜치를 checkout하도록 설정합니다.

```text
Branches to build: */배포용_브랜치명
```

중요한 기준은 특정 브랜치명이 아니라, **EC2/Jenkins가 checkout한 코드에 배포용 파일이 포함되어 있어야 한다**는 점입니다.

## 10. Spring Properties 파일 준비

현재 저장소는 보안상 `src/main/resources/application*.properties` 파일을 `.gitignore`로 제외하고 있습니다.

따라서 EC2/Jenkins에서 Git checkout만 하면 아래 파일들이 없을 수 있습니다.

```text
src/main/resources/application.properties
src/main/resources/application-prod.properties
```

운영 배포에서는 실제 비밀번호/API 키를 properties 파일에 직접 넣지 않습니다. properties 파일은 환경변수 이름만 매핑하고, 실제 값은 `/opt/team1/env/backend.env`에서 주입합니다.

### 10.1 사용할 예시 파일

```text
deploy/application.properties.example
deploy/application-prod.properties.example
```

역할:

```text
application.properties.example       공통 설정, active profile, CORS 기본값, API key 환경변수 매핑
application-prod.properties.example  운영 DB/Redis/JWT/AI 서버 환경변수 매핑
```

### 10.2 Jenkins 빌드 전에 복사

Jenkins Pipeline의 backend build 전에 아래 명령을 실행합니다.

```bash
cp deploy/application.properties.example src/main/resources/application.properties
cp deploy/application-prod.properties.example src/main/resources/application-prod.properties
```

### 10.3 운영 환경변수 파일과 연결 (확인용)

`application-prod.properties.example`은 아래와 같은 환경변수를 읽도록 되어 있습니다.

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}

app.frontend.origin=${APP_FRONTEND_ORIGIN}
app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS:${app.frontend.origin}}

ai.server.base-url=${AI_SERVER_BASE_URL:http://127.0.0.1:8000}
```

실제 값은 EC2의 이 파일에 둡니다.

```text
/opt/team1/env/backend.env
```

Docker Compose에서 backend 컨테이너가 이 파일을 읽도록 설정합니다. 이 설정은 프로젝트 루트의 `docker-compose.prod.yml` 파일 안에 들어갑니다.

예를 들어 `docker-compose.prod.yml`의 `backend` 서비스는 아래처럼 작성합니다.

```yaml
services:
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
    ports:
      - "127.0.0.1:8081:8081"
```

핵심은 이 부분입니다.

```yaml
env_file:
  - /opt/team1/env/backend.env
```

이렇게 하면 Docker Compose가 backend 컨테이너를 실행할 때 `/opt/team1/env/backend.env`에 있는 값을 컨테이너 환경변수로 주입합니다. Spring Boot의 `${DB_URL}`, `${JWT_SECRET}`, `${AI_SERVER_BASE_URL}` 같은 설정이 이 환경변수 값을 읽게 됩니다.

현재 프로젝트에 `docker-compose.prod.yml`이 아직 없다면 12번 섹션에서 파일을 생성합니다. 이미 있다면 아래 명령으로 `backend` 서비스에 `env_file`이 들어 있는지 확인합니다.

```bash
cd ~/ict06_team1_finalPJ
cat docker-compose.prod.yml
```

컨테이너 실행 후 환경변수가 들어갔는지 확인하려면 다음 명령을 사용할 수 있습니다.

```bash
docker exec team1-backend printenv | grep -E 'DB_URL|REDIS_HOST|AI_SERVER_BASE_URL|SPRING_PROFILES_ACTIVE'
```

### 10.4 Docker Compose 환경에서 주의할 URL (확인용)

Docker Compose 내부에서는 `localhost`가 EC2 자신이 아니라 각 컨테이너 자기 자신입니다.

따라서 `/opt/team1/env/backend.env`에서는 아래처럼 서비스 이름을 사용합니다.

```env
DB_URL=jdbc:postgresql://postgres:5432/ict06_team1_finalpj
REDIS_HOST=redis
AI_SERVER_BASE_URL=http://ai-server:8000
```

### 10.5 Jenkins Java와 프로젝트 Java 구분 (확인용)

Jenkins 실행:

```text
Java 21
```

프로젝트 빌드:

```text
JDK 17
```

Pipeline build 예:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
java -version
chmod +x mvnw
./mvnw clean package -DskipTests
```

## 11. Dockerfile 작성

여기서부터는 실제 파일을 생성하는 단계입니다. 아래 명령은 프로젝트 루트에서 실행합니다.

```bash
cd ~/ict06_team1_finalPJ
```

11.1은 `Dockerfile.backend` 파일을 만들고 문서의 Dockerfile 코드를 그대로 넣는다는 의미입니다. 11.2도 같은 방식으로 `Dockerfile.ai` 파일을 만듭니다.

Jenkins 자동 배포까지 사용할 경우 이 파일들은 EC2에서만 수동 생성하지 말고, 프로젝트 루트에 만든 뒤 Git에 commit/push해서 배포용 브랜치에 포함시킵니다. Jenkins는 Git checkout 결과를 `/opt/team1/current`에 동기화하므로, Git에 없는 Dockerfile은 자동 배포 때 사라질 수 있습니다.

Docker build context가 너무 커지지 않도록 `.dockerignore`도 함께 둡니다. 단, backend 이미지는 `target/*.jar`를 복사해야 하므로 jar 파일은 제외하지 않아야 합니다.

```dockerignore
.git
.idea
.vscode
node_modules
react-frontend/node_modules
react-frontend/build
target/*
!target/*.jar
venv
.venv
__pycache__
*.pyc
*.pyo
*.log
hs_err_pid*
employee
ict_06_uploads
DB
readme_images
demoSampleImg
embedding-payload.json
embedding-result.json
```

### 11.1 Backend Dockerfile

프로젝트 루트에 `Dockerfile.backend` 파일을 생성합니다.

```bash
# 파일 생성
nano Dockerfile.backend
```

```dockerfile
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 11.2 AI Server Dockerfile

프로젝트 루트에 `Dockerfile.ai` 파일을 생성합니다.

```bash
# 파일 생성
nano Dockerfile.ai
```

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

## 12. Docker Compose 작성

프로젝트 루트에 `docker-compose.prod.yml`을 둡니다.

```bash
cd ~/ict06_team1_finalPJ
nano docker-compose.prod.yml
```

Jenkins 자동 배포를 사용할 경우 `docker-compose.prod.yml`도 Git에 commit/push해야 합니다. EC2의 `/opt/team1/current`에만 수동으로 만든 파일은 Jenkins의 `rsync --delete` 단계에서 삭제될 수 있습니다.

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
      - postgres-data:/var/lib/postgresql
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
      - /opt/team1/uploads/ict_06_uploads:/app/ict_06_uploads
      - /opt/team1/uploads/employee:/app/employee
    networks:
      - team1-net
    ports:
      - "127.0.0.1:8081:8081"

networks:
  team1-net:

volumes:
  postgres-data:
  redis-data:
```

Compose에서 `${POSTGRES_PASSWORD}`를 쓰기 위해 `/opt/team1/.env`를 만듭니다.

```bash
sudo nano /opt/team1/.env
```

```env
POSTGRES_PASSWORD=운영_DB_비밀번호
```

```bash
sudo chown root:docker /opt/team1/.env
sudo chmod 640 /opt/team1/.env
```

## 13. PostgreSQL 18 DB 복원

### 13.1 dump SQL 파일 업로드

MobaXterm SFTP 패널에서 dump 방식으로 서버컴 db를 백업한 파일(형식: `dump-ict06_team1_finalpj-(백업날짜).sql`) 을 드래그 앤 드롭하여 `/home/ubuntu/backup.sql`로 업로드합니다.
업로드 후 파일 우클릭->rename 기능 이용하여 `backup.sql`로 파일명 변경합니다.

업로드 확인:

```bash
ls -lh /home/ubuntu/backup.sql
```

(Mobaxterm 으로 업로드 성공 시 패쓰 가능) PowerShell `scp` 방식:

```powershell
scp -i "키파일.pem" D:\backup\backup.sql ubuntu@EC2_PUBLIC_IP:/home/ubuntu/backup.sql
```

init 폴더로 이동:

```bash
sudo cp /home/ubuntu/backup.sql /opt/team1/db/init/01_backup.sql
sudo chown root:root /opt/team1/db/init/01_backup.sql
sudo chmod 644 /opt/team1/db/init/01_backup.sql
```

대용량 파일은 체크섬 비교를 권장합니다.

Windows PowerShell:

```powershell
Get-FileHash D:\backup\backup.sql -Algorithm SHA256
```

EC2:

```bash
sha256sum /home/ubuntu/backup.sql
```

### 13.2 최초 기동 시 자동 복원

PostgreSQL Docker 이미지는 데이터 디렉터리가 비어 있을 때 `/docker-entrypoint-initdb.d/*.sql`을 자동 실행합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d postgres
docker logs -f team1-postgres
```

주의: `postgres-data` 볼륨이 이미 만들어진 뒤에는 init SQL이 다시 실행되지 않습니다.

PostgreSQL 18 Docker 이미지는 볼륨을 `/var/lib/postgresql/data`가 아니라 `/var/lib/postgresql`에 마운트해야 합니다. compose 파일의 postgres 볼륨은 아래처럼 되어 있어야 합니다.

```yaml
volumes:
  - postgres-data:/var/lib/postgresql
  - /opt/team1/db/init:/docker-entrypoint-initdb.d
```

만약 `/var/lib/postgresql/data`로 한 번 실행해서 오류가 났다면, 아직 운영 데이터가 없는 초기 배포 테스트라는 전제에서 실패한 볼륨을 삭제한 뒤 다시 기동합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml down
docker volume ls | grep postgres
```

표시된 postgres 볼륨이 초기 테스트 중 생성된 빈/실패 볼륨임을 확인한 뒤 삭제합니다. 예시는 프로젝트 디렉터리명이 `current`일 때입니다.

```bash
docker volume rm current_postgres-data
```

그 다음 compose 파일을 수정한 상태에서 다시 시작합니다.

```bash
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d postgres
docker logs -f team1-postgres
```

### 13.3 수동 복원 방식

이미 DB 컨테이너가 떠 있다면 수동 복원도 가능합니다.

먼저 dump 파일을 컨테이너 안으로 복사합니다.

```bash
docker cp /home/ubuntu/backup.sql team1-postgres:/tmp/backup.sql
```

dump 파일 형식에 따라 복원 명령이 다릅니다.

#### PostgreSQL custom-format dump인 경우 (현재 우리 팀 방식)

아래 메시지가 나오면 파일 확장자가 `.sql`이어도 실제로는 custom-format dump입니다.

```text
The input is a PostgreSQL custom-format dump.
Use the pg_restore command-line client to restore this dump to a database.
```

이 경우 `pg_restore`를 사용합니다.

```bash
docker exec -it team1-postgres pg_restore \
  -U postgres \
  -d ict06_team1_finalpj \
  --verbose \
  /tmp/backup.sql
```

기존 객체가 일부 만들어진 상태에서 다시 복원해야 하면 `--clean --if-exists`를 추가합니다.

```bash
docker exec -it team1-postgres pg_restore \
  -U postgres \
  -d ict06_team1_finalpj \
  --clean \
  --if-exists \
  --verbose \
  /tmp/backup.sql
```

복원 확인:

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "\dt"
```

#### plain SQL dump인 경우 (참고)

일반 SQL 텍스트 파일이면 `psql -f`를 사용합니다.

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -f /tmp/backup.sql
```

## 14. Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/team1
```

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

    location = /ai-api/health {
        proxy_pass http://127.0.0.1:8000/health;
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

    # Spring MVC admin pages, Spring static resources, existing helper calls, and uploaded files use backend root paths.
    location ~ ^/(admin|css|js|images|calendar|attendance|leave|test|approval/uploads|employee/uploads)(/|$) {
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
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 14.1 HTTPS 적용

브라우저 Geolocation API는 `https://도메인` 또는 `http://localhost` 같은 보안 출처에서만 동작합니다. 출근/퇴근 GPS 기능을 배포 환경에서 테스트하려면 IP 주소 HTTP 접속이 아니라 HTTPS 도메인 접속으로 바꿔야 합니다.

전체 순서:

```text
sslip.io 무료 도메인 또는 무료 DDNS 서브도메인 준비
-> sslip.io는 별도 DNS 설정 없이 EC2 탄력적 IP 기반 주소 사용
-> AWS 보안그룹에서 80, 443 오픈
-> Nginx server_name을 도메인으로 변경
-> Certbot으로 Let's Encrypt 인증서 발급
-> backend env의 frontend/cors origin을 https 도메인으로 변경
-> Jenkins webhook URL도 https 도메인으로 변경
```

#### 14.1.1 프리티어 시연용 도메인 선택

유료 도메인을 구매하지 않아도 HTTPS 적용은 가능합니다. Let's Encrypt 인증서는 IP 주소 자체에는 발급할 수 없지만, `sslip.io`처럼 IP를 도메인 이름에 포함하는 무료 DNS 주소나 DuckDNS 같은 무료 DDNS 서브도메인에는 발급할 수 있습니다.

이 프로젝트의 프리티어 시연에서는 DuckDNS의 CAA DNS 조회가 Let's Encrypt 검증 과정에서 타임아웃될 수 있으므로, 기본 방식은 `sslip.io`를 사용합니다.

권장 선택지:

```text
프리티어 시연 기본값: sslip.io 사용
무료 DDNS 대안: DuckDNS 사용. DNS CAA 조회 타임아웃이 발생하면 인증서 발급이 실패할 수 있음
유료로 진행: Route 53 또는 외부 도메인 구매 후 DNS A 레코드 연결
임시 우회: Chrome insecure origin 허용 옵션 사용. 운영 방식 아님
```

sslip.io는 도메인 이름 앞부분의 IP를 그대로 DNS A 레코드로 응답하는 무료 서비스입니다. 따라서 별도 회원가입, 서브도메인 생성, DNS A 레코드 설정이 필요 없습니다.

예시:

```text
43.200.198.243.sslip.io -> 43.200.198.243
```

이 프로젝트의 HTTPS 시연 주소:

```text
YOUR_DOMAIN = 43.200.198.243.sslip.io
```

확인:

```bash
nslookup 43.200.198.243.sslip.io
```

결과 IP가 EC2 탄력적 IP로 나오면 이후 문서의 `YOUR_DOMAIN` 자리에 `43.200.198.243.sslip.io`를 넣습니다.

주의:

```text
sslip.io는 프리티어 시연, 통합테스트, 포트폴리오 확인 용도에는 적합합니다.
다만 내 소유 도메인이 아니므로 장기 운영 또는 공식 서비스 주소로는 유료 도메인이나 안정적인 DNS를 권장합니다.
```

DuckDNS를 대안으로 사용하는 경우:

```text
YOUR_SUBDOMAIN.duckdns.org -> EC2 탄력적 IP
```

```text
1. https://www.duckdns.org 접속
2. GitHub/Google 등으로 로그인
3. 원하는 subdomain 생성
4. current ip 또는 ip 입력칸에 EC2 탄력적 IP 입력
5. update ip 클릭
```

예시:

```text
corework.duckdns.org -> 43.200.198.243
```

확인:

```bash
nslookup corework.duckdns.org
```

결과 IP가 EC2 탄력적 IP로 나오면 이후 문서의 `YOUR_DOMAIN` 자리에 DuckDNS 주소를 넣으면 됩니다.

```text
YOUR_DOMAIN = corework.duckdns.org
```

만약 Certbot 실행 시 아래처럼 CAA 조회 타임아웃이 발생하면 DuckDNS DNS 응답 문제일 가능성이 큽니다.

```text
DNS problem: query timed out looking up CAA for duckdns.org
```

이 경우 짧은 시간에 반복 재시도하지 말고, 프리티어 시연에서는 `sslip.io` 방식으로 우회하는 것을 권장합니다.

유료 도메인을 쓰는 경우에는 도메인 관리 화면에서 A 레코드를 추가합니다.

```text
Type: A
Name: @ 또는 원하는 서브도메인
Value: EC2 탄력적 IP
TTL: 기본값 또는 300
```

예시:

```text
team1.example.com -> 43.200.198.243
```

DNS 전파 확인:

```bash
nslookup YOUR_DOMAIN
```

결과 IP가 EC2 탄력적 IP로 나오면 다음 단계로 진행합니다.

AWS에서 유료 도메인을 관리하려면 Route 53을 사용합니다. 프리티어만 사용할 계획이라면 이 Route 53 도메인 구매 단계는 건너뛰고 `sslip.io` 방식을 사용합니다.

Route 53에서 새 도메인을 구매하는 경우:

```text
AWS Console
-> Route 53
-> Registered domains
-> Register domain
-> 원하는 도메인 검색 및 구매
```

도메인을 구매하면 보통 Hosted zone이 함께 생성됩니다. 생성되지 않았다면 아래처럼 직접 만듭니다.

```text
Route 53
-> Hosted zones
-> Create hosted zone
-> Domain name: YOUR_DOMAIN
-> Type: Public hosted zone
-> Create hosted zone
```

Hosted zone 안에서 A 레코드를 생성합니다.

```text
Create record
-> Record name: 비워두면 루트 도메인, www/team1 등 입력하면 서브도메인
-> Record type: A
-> Value: EC2 탄력적 IP
-> TTL: 기본값
-> Routing policy: Simple routing
-> Create records
```

예시:

```text
example.com       A  43.200.198.243
www.example.com   A  43.200.198.243
```

이미 다른 업체에서 구매한 도메인을 Route 53 Hosted zone으로 관리하려면, Route 53 Hosted zone에 표시된 NS 레코드 4개를 도메인 구매처의 네임서버 설정에 등록해야 합니다.

```text
Route 53 Hosted zone의 NS 값 확인
-> 도메인 구매처 DNS/네임서버 설정 화면
-> 기존 네임서버를 Route 53 NS 4개로 교체
```

도메인 구매처 DNS를 그대로 쓸 경우에는 Route 53을 만들 필요 없이, 도메인 구매처 DNS 관리 화면에서 A 레코드만 EC2 탄력적 IP로 추가하면 됩니다.

#### 14.1.2 보안그룹 확인

AWS EC2 보안그룹 인바운드 규칙에 아래가 열려 있어야 합니다.

```text
80   HTTP   0.0.0.0/0
443  HTTPS  0.0.0.0/0
22   SSH    내 IP
```

Jenkins 8080은 외부 전체 공개하지 않는 것을 권장합니다. GitHub webhook은 Nginx의 `/github-webhook/` 프록시로 받습니다.

#### 14.1.3 Nginx server_name 변경

EC2에서 Nginx 설정을 수정합니다.

```bash
sudo nano /etc/nginx/sites-available/team1
```

`server_name`을 IP 대신 도메인으로 바꿉니다.

프리티어 시연 기준:

```nginx
server_name 43.200.198.243.sslip.io;
```

전체 예시:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;

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

    location = /ai-api/health {
        proxy_pass http://127.0.0.1:8000/health;
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

    location /github-webhook/ {
        proxy_pass http://127.0.0.1:8080/github-webhook/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ ^/(admin|css|js|images|calendar|attendance|leave|test|approval/uploads|employee/uploads)(/|$) {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

적용 전 문법 확인:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 14.1.4 Certbot 설치 및 인증서 발급

Ubuntu에서 Certbot을 설치합니다.

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

인증서를 발급하고 Nginx HTTPS 설정을 자동 적용합니다.

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

프리티어 시연 기준:

```bash
sudo certbot --nginx -d 43.200.198.243.sslip.io
```

진행 중 이메일을 입력하고, HTTP를 HTTPS로 redirect할지 물으면 redirect를 선택합니다. 성공하면 Certbot이 Nginx 설정에 443 SSL server block과 인증서 경로를 추가합니다.

확인:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://YOUR_DOMAIN
```

프리티어 시연 기준:

```bash
curl -I https://43.200.198.243.sslip.io
```

인증서 자동 갱신 확인:

```bash
sudo certbot renew --dry-run
```

#### 14.1.5 backend env origin 변경

HTTPS 도메인을 쓰면 backend origin 설정도 도메인으로 맞춥니다.

```bash
sudo nano /opt/team1/env/backend.env
```

아래 값을 변경합니다.

```env
APP_FRONTEND_ORIGIN=https://YOUR_DOMAIN
APP_CORS_ALLOWED_ORIGINS=https://YOUR_DOMAIN
APP_FRONTEND_LOGIN_URL=https://YOUR_DOMAIN/auth/login
```

프리티어 시연 기준:

```env
APP_FRONTEND_ORIGIN=https://43.200.198.243.sslip.io
APP_CORS_ALLOWED_ORIGINS=https://43.200.198.243.sslip.io
APP_FRONTEND_LOGIN_URL=https://43.200.198.243.sslip.io/auth/login
```

이 값들은 브라우저에서 실제 접속하는 origin과 정확히 같아야 합니다. 예를 들어 `https://43.200.198.243.sslip.io/auth/login`에서 로그인하는데 backend env가 `http://43.200.198.243` 또는 `https://corework.duckdns.org`로 남아 있으면 `/api/auth/login`이 403으로 실패할 수 있습니다.

backend 컨테이너 재생성:

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d --force-recreate backend
```

#### 14.1.6 GitHub webhook URL 변경

GitHub repository의 webhook URL도 HTTPS 도메인으로 바꿉니다.

```text
Payload URL: https://YOUR_DOMAIN/github-webhook/
Content type: application/json
Events: Just the push event
Active: 체크
```

프리티어 시연 기준:

```text
Payload URL: https://43.200.198.243.sslip.io/github-webhook/
```

GitHub Webhook 상세 화면의 `Recent Deliveries`에서 응답 코드가 `200`인지 확인합니다.

#### 14.1.7 HTTPS 접속 확인

브라우저에서 아래를 확인합니다.

```text
https://YOUR_DOMAIN
https://YOUR_DOMAIN/admin/login
https://YOUR_DOMAIN/ai-api/health
```

프리티어 시연 기준:

```text
https://43.200.198.243.sslip.io
https://43.200.198.243.sslip.io/admin/login
https://43.200.198.243.sslip.io/ai-api/health
```

출근/퇴근 GPS 테스트:

```text
1. https://43.200.198.243.sslip.io 로 접속
2. 주소창 왼쪽 사이트 설정에서 위치 권한 허용
3. 출근하기 클릭
4. 브라우저 콘솔에서 Only secure origins are allowed 오류가 사라졌는지 확인
```

## 15. Jenkins Pipeline 구성

이 단계부터는 수동으로 입력하던 빌드/복사/컨테이너 재생성 명령을 Jenkins가 대신 실행하게 만듭니다.

처음에는 GitHub push 자동 트리거까지 바로 연결하지 말고, Jenkins 화면에서 `Build Now` 버튼을 누르면 배포되는 방식으로 구성합니다. 이 방식이 안정화된 뒤 GitHub webhook을 붙입니다.

자동 배포가 하는 일:

```text
GitHub 브랜치 checkout
-> Spring properties 파일 복사
-> backend jar 빌드
-> React build
-> React build 결과를 /var/www/team1에 복사
-> /opt/team1/current에 배포 파일 동기화
-> Docker image build
-> docker compose up -d로 컨테이너 재생성
-> Nginx reload
```

자동 배포가 하지 않는 일:

```text
DB drop/create
backup.sql 복원
docker volume prune
docker compose down -v
/opt/team1/uploads 삭제
```

DB 복원, backup.sql 교체, 업로드 폴더 이관은 별도 운영 작업으로 분리합니다.

웹브라우저의 Jenkins 페이지에서 진행합니다.
Jenkins Item:

```text
New Item 
-> item name = '(원하는 이름)', item type = Pipeline 
-> OK
```

처음 배포 테스트라면 이렇게 하시면 됩니다.

### General

- 설명: 선택 사항
- Do not allow concurrent builds: 체크 추천
- 나머지: 비워도 됨

### Triggers

- 전부 비워도 됨
- 지금은 GitHub webhook이 아니라 Jenkins 화면에서 `Build Now`로 실행할 것이므로 필요 없습니다.

### Pipeline

- Definition: Pipeline script 선택
- Script: 문서의 권장 Pipeline 스크립트 붙여넣기
- Use Groovy Sandbox: 체크 유지

권장 Pipeline 스크립트입니다. `BRANCH_NAME`은 실제 배포용 파일이 들어 있는 브랜치명으로 바꿉니다.

```groovy
pipeline {
    agent any

    environment {
        REPOSITORY_URL = "https://github.com/youngeunsong/ict06_team1_finalPJ.git"
        BRANCH_NAME = "topic/aws_test"
        DEPLOY_DIR = "/opt/team1/current"
        FRONT_DIR = "/var/www/team1"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${BRANCH_NAME}", url: "${REPOSITORY_URL}"
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
                sh '''
                export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
                export PATH=$JAVA_HOME/bin:$PATH
                java -version
                chmod +x mvnw
                ./mvnw clean package -DskipTests
                '''
            }
        }

        stage('Build React') {
            steps {
                dir('react-frontend') {
                    sh '''
                    export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
                    node -v
                    npm -v
                    npm ci
                    CI=false \
                    GENERATE_SOURCEMAP=false \
                    NODE_OPTIONS=--max-old-space-size=1024 \
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
                  --exclude .env \
                  --exclude application.properties \
                  --exclude application-prod.properties \
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
                test -f docker-compose.prod.yml
                test -f Dockerfile.backend
                test -f Dockerfile.ai
                docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml build backend ai-server
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
                docker ps
                for i in $(seq 1 60); do
                  FRONT_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://43.200.198.243.sslip.io/ || true)
                  AI_DIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health || true)
                  AI_NGINX_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://43.200.198.243.sslip.io/ai-api/health || true)
                  BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/api/user/me || true)

                  echo "front=$FRONT_CODE ai_direct=$AI_DIRECT_CODE ai_nginx=$AI_NGINX_CODE backend=$BACKEND_CODE"

                  if [ "$FRONT_CODE" = "200" ] \
                    && [ "$AI_DIRECT_CODE" = "200" ] \
                    && [ "$AI_NGINX_CODE" = "200" ] \
                    && [ "$BACKEND_CODE" = "401" ]; then
                    echo "Health check passed"
                    exit 0
                  fi

                  echo "Waiting for services... ($i/60)"
                  sleep 5
                done

                echo "Health check failed"
                docker ps
                docker logs --tail=100 team1-ai-server || true
                docker logs --tail=150 team1-backend || true
                exit 1
                '''
            }
        }
    }
}
```

GitHub 저장소가 private이면 Jenkins Credentials에 GitHub token 또는 SSH key를 등록한 뒤 checkout 부분에 `credentialsId`를 추가합니다.

```groovy
git branch: "${BRANCH_NAME}",
    url: "${REPOSITORY_URL}",
    credentialsId: "github-credentials-id"
```

이후 EC2 터미널에서 Jenkins 사용자가 필요한 sudo 명령만 실행할 수 있게 제한합니다.

```bash
sudo visudo
```

추가:

```text
jenkins ALL=(ALL) NOPASSWD: /usr/bin/mkdir, /usr/bin/rsync, /usr/bin/cp, /usr/bin/rm, /usr/bin/chown, /usr/sbin/nginx, /bin/systemctl reload nginx, /usr/bin/systemctl reload nginx
```

Jenkins가 Docker와 env 파일을 읽을 수 있는지 확인합니다.

```bash
sudo usermod -aG docker jenkins

sudo chown root:docker /opt/team1/.env
sudo chmod 640 /opt/team1/.env

sudo chown root:docker /opt/team1/env/backend.env /opt/team1/env/ai.env
sudo chmod 640 /opt/team1/env/backend.env /opt/team1/env/ai.env

sudo systemctl restart jenkins
```

Jenkins 재시작 후 웹브라우저에서 Jenkins job으로 들어가 `Build Now(▶️지금 빌드)`를 클릭합니다. 왼쪽 `Build History`에서 새 빌드를 클릭한 뒤 `Console Output`을 보면 진행 상황을 확인할 수 있습니다.

빌드 성공 후 확인:

```bash
docker ps
curl http://127.0.0.1/ai-api/health
curl -I http://127.0.0.1/admin/login
```

브라우저에서 확인:

```text
http://EC2_PUBLIC_IP
http://EC2_PUBLIC_IP/admin/login
```

### 15.1 GitHub push 시 자동 실행으로 바꾸기

`Build Now` 방식이 안정화된 뒤에만 GitHub webhook을 연결합니다.

Jenkins job 설정:

```text
Triggers
-> GitHub hook trigger for GITScm polling 체크
```

GitHub repository 설정:

```text
Settings
-> Webhooks
-> Add webhook
```

Webhook 값:

```text
Payload URL: https://43.200.198.243.sslip.io/github-webhook/
Content type: application/json
Events: Just the push event
Active: 체크
```

Jenkins 8080 포트를 GitHub webhook 때문에 외부에 직접 열어둘 수도 있지만, 운영 기준으로는 Nginx에서 webhook 경로만 Jenkins로 프록시하는 방식을 권장합니다. 이 경우 Jenkins 8080 포트는 보안그룹에서 내 IP만 허용하거나 닫아두고, GitHub webhook은 443의 `/github-webhook/`으로 받습니다.

Nginx 설정에 아래 location을 추가합니다.

```nginx
location /github-webhook/ {
    proxy_pass http://127.0.0.1:8080/github-webhook/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

적용:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Nginx 프록시 방식을 사용하면 GitHub Webhook 값은 아래처럼 설정합니다.

```text
Payload URL: https://43.200.198.243.sslip.io/github-webhook/
Content type: application/json
Events: Just the push event
Active: 체크
```

GitHub webhook 저장 후 GitHub의 Webhook 상세 화면에서 `Recent Deliveries`를 열어 응답 코드가 `200`인지 확인합니다. 이후 배포 브랜치에 push하면 Jenkins job의 Build History에 새 빌드가 자동으로 생성되어야 합니다.

주의:

```text
8080 직접 호출 방식은 Jenkins 포트를 외부에 열어야 하므로 권장하지 않음
Nginx 프록시 방식을 쓰면 443만 GitHub webhook에 사용하고 Jenkins 8080은 외부에 직접 열지 않는 것을 권장
운영 배포 브랜치에 push할 때만 자동 배포되도록 브랜치명을 명확히 관리
```

## 16. 최초 수동 배포 테스트

Jenkins 자동화 전, EC2에서 한 번 수동으로 확인합니다.

Linux에서 `./mvnw: Permission denied`가 나오면 Maven Wrapper에 실행 권한이 없는 상태입니다. 이 경우 `sudo`로 실행하지 말고 `chmod +x mvnw`를 먼저 실행합니다.

(참고)Querydsl을 사용하는 프로젝트라면 개발 환경에서 Maven `clean` 후 `build/package`를 실행해 QClass를 생성했던 과정이 배포 시에도 빌드 단계에 포함되어야 합니다. 다만 별도 명령을 추가할 필요는 없고, Maven 설정이 정상이라면 아래의 `./mvnw clean package -DskipTests` 과정에서 annotation processing이 실행되며 QClass가 생성되고 jar에 포함됩니다. QClass 생성 문제가 있으면 보통 Docker 실행 후 런타임 오류가 아니라 Maven 빌드 중 `cannot find symbol Q...` 형태의 컴파일 오류로 실패합니다.

```bash
cd /opt/team1/current

cp deploy/application.properties.example src/main/resources/application.properties
cp deploy/application-prod.properties.example src/main/resources/application-prod.properties

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
chmod +x mvnw
./mvnw clean package -DskipTests

cd react-frontend
npm ci
NODE_OPTIONS=--max-old-space-size=2048 REACT_APP_SERVER_URL=/api REACT_APP_AI_SERVER_URL=/ai-api npm run build
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

## 17. 배포 후 확인 URL

```text
React
http://EC2_PUBLIC_IP

AI health through Nginx
http://EC2_PUBLIC_IP/ai-api/health

AI health direct local on EC2
curl http://127.0.0.1:8000/health
```

로그인 요청이 정상이라면 브라우저 개발자도구 Network에서 요청 주소가 다음처럼 보여야 합니다.

```text
POST http://EC2_PUBLIC_IP/api/auth/login
```

## 18. 운영 명령 모음

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

## 19. DB 백업

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

## 20. 자주 나는 문제

### React build가 JavaScript heap out of memory로 실패하는 경우

아래 오류가 나오면 React build 중 Node.js 메모리 제한에 걸린 것입니다.

```text
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

이 경우 `npm run build` 앞에 `NODE_OPTIONS=--max-old-space-size=2048`를 붙여 다시 실행합니다.

```bash
cd /opt/team1/current/react-frontend
NODE_OPTIONS=--max-old-space-size=2048 REACT_APP_SERVER_URL=/api REACT_APP_AI_SERVER_URL=/ai-api npm run build
```

EC2 메모리가 충분하다면 3072 또는 4096으로 올릴 수 있습니다.

```bash
NODE_OPTIONS=--max-old-space-size=4096 REACT_APP_SERVER_URL=/api REACT_APP_AI_SERVER_URL=/ai-api npm run build
```

메모리 자체가 부족한 EC2라면 swap을 추가한 뒤 다시 빌드합니다.

```bash
free -h
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

영구 적용하려면 `/etc/fstab`에 아래 줄을 추가합니다.

```text
/swapfile none swap sw 0 0
```

### Jenkins React build 중 OOM killer가 Jenkins를 종료하는 경우

Jenkins Console Output이 아래 상태에서 오래 멈춘 뒤 Jenkins가 재시작되거나 빌드가 중단되면, React build가 오래 걸리는 것이 아니라 EC2 메모리 부족으로 Jenkins 프로세스가 종료된 상황일 수 있습니다.

```text
Creating an optimized production build...
```

Jenkins 로그에 아래 메시지가 보이면 커널 OOM killer가 Jenkins를 종료한 것입니다.

```text
The kernel OOM killer killed some processes in this unit.
jenkins.service: Failed with result 'oom-kill'.
```

이 경우 `react-frontend/build` 폴더가 있어도 비어 있을 수 있습니다.

```bash
ls -lh /var/lib/jenkins/workspace/JOB_NAME/react-frontend/build
```

먼저 메모리와 swap 상태를 확인합니다.

```bash
free -h
swapon --show
sudo journalctl -u jenkins -n 150 --no-pager | grep -i -E 'oom|killed'
```

swap이 없거나 너무 작다면 4G swap을 추가합니다. 이미 `/swapfile`이 있으면 아래 명령을 바로 실행하지 말고 `swapon --show`, `ls -lh /swapfile`로 기존 swap 크기부터 확인합니다.

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

이미 `/swapfile`이 사용 중인데 크기를 늘리려고 하면 아래처럼 실패합니다.

```text
fallocate: fallocate failed: Text file busy
mkswap: error: /swapfile is mounted; will not make swapspace
swapon: /swapfile: swapon failed: Device or resource busy
```

이 경우 기존 `/swapfile`을 건드리지 말고, 추가 swap 파일을 하나 더 만드는 방식이 가장 간단합니다. 예를 들어 기존 swap이 2G라면 2G를 추가해서 총 4G로 맞춥니다.

```bash
df -h
sudo fallocate -l 2G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
free -h
swapon --show
```

추가한 swap도 재부팅 후 유지하려면 `/etc/fstab`에 아래 줄을 추가합니다.

```bash
echo '/swapfile2 none swap sw 0 0' | sudo tee -a /etc/fstab
```

재부팅 후에도 유지하려면 `/etc/fstab`에 아래 줄을 추가합니다.

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

작은 EC2에서는 Jenkins executor를 `1`로 두는 것을 권장합니다.

```text
Jenkins 관리
-> Nodes
-> Built-In Node
-> Configure
-> Number of executors = 1
```

그리고 Pipeline의 React build 단계에서는 Node가 과도한 메모리를 잡지 않도록 `NODE_OPTIONS=--max-old-space-size=1024` 정도로 시작합니다.

```groovy
stage('Build React') {
    steps {
        dir('react-frontend') {
            sh '''
            export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
            node -v
            npm -v
            npm ci
            CI=false \
            GENERATE_SOURCEMAP=false \
            NODE_OPTIONS=--max-old-space-size=1024 \
            REACT_APP_SERVER_URL=/api \
            REACT_APP_AI_SERVER_URL=/ai-api \
            npm run build
            '''
        }
    }
}
```

조치 후 Jenkins를 재시작하고, 대기 중이거나 실패한 이전 빌드는 취소한 뒤 다시 `Build Now`를 실행합니다.

```bash
sudo systemctl restart jenkins
```

### Docker Compose가 env 파일 permission denied로 실패하는 경우

아래 오류가 나오면 Docker Compose를 실행하는 사용자(`ubuntu` 또는 `jenkins`)가 env 파일을 읽지 못하는 상태입니다.

```text
open /opt/team1/.env: permission denied
open /opt/team1/env/backend.env: permission denied
open /opt/team1/env/ai.env: permission denied
```

수동 배포와 Jenkins 배포 모두 Docker Compose가 env 파일을 읽어야 하므로, env 파일의 그룹을 `docker`로 두고 그룹 읽기 권한을 줍니다.

```bash
sudo chown root:docker /opt/team1/.env
sudo chmod 640 /opt/team1/.env

sudo chown root:docker /opt/team1/env/backend.env /opt/team1/env/ai.env
sudo chmod 640 /opt/team1/env/backend.env /opt/team1/env/ai.env
```

확인:

```bash
ls -l /opt/team1/.env /opt/team1/env/backend.env /opt/team1/env/ai.env
```

아래처럼 보이면 정상입니다.

```text
-rw-r----- 1 root docker ... /opt/team1/.env
-rw-r----- 1 root docker ... /opt/team1/env/backend.env
-rw-r----- 1 root docker ... /opt/team1/env/ai.env
```

현재 사용자와 Jenkins 사용자가 `docker` 그룹에 들어 있는지도 확인합니다.

```bash
groups
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

`ubuntu` 사용자의 `groups`에 `docker`가 없다면 SSH를 재접속한 뒤 다시 확인합니다.

### React가 `/api`를 React 서버로 보내는 경우

운영 빌드는 다음 값으로 빌드해야 합니다.

```bash
REACT_APP_SERVER_URL=/api
REACT_APP_AI_SERVER_URL=/ai-api
```

### CORS 오류

`/opt/team1/env/backend.env`:

```env
APP_FRONTEND_ORIGIN=https://43.200.198.243.sslip.io
APP_CORS_ALLOWED_ORIGINS=https://43.200.198.243.sslip.io
APP_FRONTEND_LOGIN_URL=https://43.200.198.243.sslip.io/auth/login
```

`/opt/team1/env/ai.env`:

```env
ALLOWED_ORIGINS=https://43.200.198.243.sslip.io
```

`/api/auth/login`이 403으로 실패하면 브라우저에서 접속한 주소와 위 origin 값이 정확히 같은지 먼저 확인합니다. `http://43.200.198.243`, `https://corework.duckdns.org`, `YOUR_DOMAIN` 등 예전 값이 남아 있으면 HTTPS 배포 주소와 origin이 달라져 실패할 수 있습니다.

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

backend 로그에 아래와 비슷한 메시지가 나오면 Spring Boot 컨테이너가 DB 주소를 `127.0.0.1` 또는 `localhost`로 보고 있는 상태입니다.

```text
Connection to 127.0.0.1:5432 refused
Unable to open JDBC Connection for DDL execution
```

이 경우 `/opt/team1/env/backend.env`를 확인합니다.

```bash
grep '^DB_URL' /opt/team1/env/backend.env
```

반드시 아래처럼 Docker Compose 서비스명 `postgres`를 사용해야 합니다.

```env
DB_URL=jdbc:postgresql://postgres:5432/ict06_team1_finalpj
```

함께 확인할 값:

```env
SPRING_PROFILES_ACTIVE=prod
REDIS_HOST=redis
AI_SERVER_BASE_URL=http://ai-server:8000
```

배포 테스트처럼 dump로 복원한 DB 스키마를 그대로 사용할 때는 Hibernate가 테이블을 생성하거나 수정하지 않도록 아래 값도 추가하는 것을 권장합니다.

```env
SPRING_JPA_HIBERNATE_DDL_AUTO=none
```

수정이 필요하면:

```bash
sudo nano /opt/team1/env/backend.env
sudo chown root:docker /opt/team1/env/backend.env
sudo chmod 640 /opt/team1/env/backend.env
```

환경변수 파일을 수정한 뒤에는 단순 restart보다 backend 컨테이너를 재생성하는 것이 확실합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d --force-recreate backend
docker logs -f team1-backend
```

컨테이너에 실제 주입된 환경변수는 다음으로 확인할 수 있습니다.

```bash
docker exec team1-backend printenv | grep -E 'DB_URL|REDIS_HOST|AI_SERVER_BASE_URL|SPRING_PROFILES_ACTIVE'
```

backend 컨테이너가 너무 빨리 종료되어 `docker exec`가 안 되면 `docker inspect`로 확인합니다.

```bash
docker inspect team1-backend --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E 'DB_URL|REDIS_HOST|AI_SERVER_BASE_URL|SPRING_PROFILES_ACTIVE'
```

### Git에 없는 업로드 폴더를 EC2에 반영하는 경우

`ict_06_uploads`, `employee`처럼 `.gitignore`로 제외한 업로드 폴더는 Git/Jenkins 배포로 전달되지 않습니다. Google Drive에서 받은 파일을 MobaXterm SFTP로 EC2에 업로드한 뒤, backend 컨테이너에 bind mount로 연결해서 사용합니다.

EC2에서 영구 보관 디렉터리를 준비합니다.

```bash
sudo mkdir -p /opt/team1/uploads/ict_06_uploads
sudo mkdir -p /opt/team1/uploads/employee
sudo chown -R ubuntu:ubuntu /opt/team1/uploads
```

MobaXterm SFTP 패널에서 아래처럼 업로드합니다.

```text
Windows \ict06_team1_finalPJ\ict_06_uploads  -> EC2 /opt/team1/uploads/ict_06_uploads
Windows \ict06_team1_finalPJ\employee        -> EC2 /opt/team1/uploads/employee
```

업로드 후 EC2에서 확인합니다.

```bash
ls -lh /opt/team1/uploads
ls -lh /opt/team1/uploads/ict_06_uploads
ls -lh /opt/team1/uploads/employee
```

`docker-compose.prod.yml`의 backend 서비스에 아래 volume이 있어야 합니다.

```yaml
services:
  backend:
    volumes:
      - /opt/team1/uploads/ict_06_uploads:/app/ict_06_uploads
      - /opt/team1/uploads/employee:/app/employee
```

이 매핑이 필요한 이유는 Spring 코드가 컨테이너 내부에서 다음 경로를 기준으로 파일을 읽고 쓰기 때문입니다.

```text
/app/ict_06_uploads/approval      -> 브라우저 /approval/uploads/**
/app/employee/ict_06_uploads      -> 브라우저 /employee/uploads/**
```

volume 설정을 추가하거나 업로드 파일을 교체했다면 backend 컨테이너를 재생성합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d --force-recreate backend
```

컨테이너 안에서도 파일이 보이는지 확인합니다.

```bash
docker exec -it team1-backend ls -lh /app/ict_06_uploads
docker exec -it team1-backend ls -lh /app/employee
docker exec -it team1-backend ls -lh /app/employee/ict_06_uploads
```

Nginx도 업로드 파일 URL을 backend로 넘겨야 합니다. `/etc/nginx/sites-available/team1`에 아래 경로가 포함되어 있는지 확인합니다.

```nginx
location ~ ^/(calendar|attendance|leave|test|approval/uploads|employee/uploads)(/|$) {
    proxy_pass http://127.0.0.1:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Nginx 설정을 수정했다면 적용합니다.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

브라우저에서 기존 DB에 저장된 파일 경로를 열어 확인합니다.

```text
http://EC2_PUBLIC_IP/approval/uploads/파일명
http://EC2_PUBLIC_IP/employee/uploads/profile/파일명
http://EC2_PUBLIC_IP/employee/uploads/sign/파일명
```

주의: `docker compose down -v`는 DB 볼륨을 지울 수 있으므로 업로드 폴더와 직접 관련은 없더라도 운영/테스트 데이터가 있는 상태에서는 신중하게 사용합니다.

### Hibernate Schema validation 타입 오류가 나는 경우

DB 연결은 성공했지만 아래처럼 `Schema validation` 오류로 backend가 종료될 수 있습니다.

```text
Schema validation: wrong column type encountered in column [is_deleted] in table [employee]
found [bpchar (Types#CHAR)], but expecting [char(1) (Types#VARCHAR)]
```

이 로그는 QClass 문제가 아니라 Hibernate가 엔티티와 실제 DB 컬럼 타입을 엄격하게 비교하다가 시작을 중단한 것입니다. 이미 서버컴퓨터 DB를 dump로 복원한 상태라면, 배포 테스트에서는 Hibernate 스키마 검증을 끄고 애플리케이션을 먼저 기동하는 방식이 안전합니다.

`/opt/team1/env/backend.env`에 아래 값을 추가합니다.

```env
SPRING_JPA_HIBERNATE_DDL_AUTO=none
```

적용:

```bash
sudo nano /opt/team1/env/backend.env
sudo chown root:docker /opt/team1/env/backend.env
sudo chmod 640 /opt/team1/env/backend.env

cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d --force-recreate backend
docker logs -f team1-backend
```

정상이라면 더 이상 `Schema validation`에서 종료되지 않고 Tomcat 8081 기동 완료 로그가 이어집니다.

장기적으로는 `EmpEntity.isDeleted` 매핑과 실제 DB의 `employee.is_deleted` 타입을 일치시키는 코드 수정 또는 DB migration을 별도 브랜치에서 정리하는 것이 좋습니다.

### AI 서버를 Spring이 못 찾는 경우

Docker Compose 내부에서는 AI host가 `localhost`가 아닙니다.

정상:

```env
AI_SERVER_BASE_URL=http://ai-server:8000
```

### Jenkins가 Waiting for next available executor에서 멈추는 경우

Jenkins Console Output이 아래 상태로 오래 멈추면 빌드가 아직 시작되지 못한 것입니다.

```text
Still waiting to schedule task
Waiting for next available executor
```

먼저 Jenkins executor 설정을 확인합니다.

```text
Jenkins 관리
-> Nodes
-> Built-In Node
-> Configure
-> Number of executors = 1 또는 2
```

EC2 사양이 작다면 `1`을 권장합니다. executor를 늘렸는데도 계속 대기하면 Jenkins controller가 disk monitor 때문에 offline 상태일 수 있습니다.

Jenkins 상태 로그에 아래 경고가 보이면 임시 디렉터리 공간이 너무 작다는 뜻입니다.

```text
temporary-space : Only 0.447 Gb free on (controller)
```

Ubuntu EC2에서 `/tmp`가 작은 tmpfs로 잡혀 있으면 Jenkins가 사용할 임시 디렉터리를 디스크 공간이 넉넉한 곳으로 바꿉니다.

```bash
sudo mkdir -p /var/lib/jenkins/tmp
sudo chown jenkins:jenkins /var/lib/jenkins/tmp
sudo chmod 750 /var/lib/jenkins/tmp
```

Jenkins systemd override를 수정합니다.

```bash
sudo nano /etc/systemd/system/jenkins.service.d/override.conf
```

아래처럼 `JAVA_OPTS`를 추가합니다. 기존 Java 21 설정은 유지합니다.

```ini
[Service]
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="JENKINS_JAVA_CMD=/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
Environment="JAVA_OPTS=-Djava.awt.headless=true -Djava.io.tmpdir=/var/lib/jenkins/tmp"
```

적용:

```bash
sudo systemctl daemon-reload
sudo systemctl restart jenkins
sudo systemctl status jenkins --no-pager -l
```

Jenkins 실행 명령에 `-Djava.io.tmpdir=/var/lib/jenkins/tmp`가 포함되어 있는지 확인합니다.

```bash
ps -ef | grep '[j]enkins.war'
```

Jenkins 웹에서 대기 중인 이전 빌드를 취소한 뒤 다시 `Build Now`를 클릭합니다. 정상이라면 Console Output이 `Checkout`, `Build Backend Jar` 같은 stage로 넘어갑니다.

### Jenkins에서 npm: not found가 나는 경우

Console Output에서 React build 단계가 아래처럼 실패하면 Jenkins 실행 환경에서 `npm`을 찾지 못하는 상태입니다.

```text
npm: not found
ERROR: script returned exit code 127
```

EC2에서 먼저 Node.js/npm 설치 여부를 확인합니다.

```bash
which node
which npm
node -v
npm -v
```

설치되어 있지 않다면 설치합니다.

```bash
sudo apt update
sudo apt install -y nodejs npm
node -v
npm -v
```

Jenkins 사용자 기준으로도 보이는지 확인합니다.

```bash
sudo -u jenkins which node
sudo -u jenkins which npm
sudo -u jenkins node -v
sudo -u jenkins npm -v
```

설치 후 Jenkins를 재시작하고 다시 `Build Now`를 실행합니다.

```bash
sudo systemctl restart jenkins
```

만약 `ubuntu` 사용자에서는 보이는데 `jenkins` 사용자에서는 안 보이면 Node/npm 경로를 Pipeline에 명시합니다. 예를 들어 `which npm` 결과가 `/usr/bin/npm`이면 React build stage에서 아래처럼 PATH를 추가합니다.

```groovy
stage('Build React') {
    steps {
        dir('react-frontend') {
            sh '''
            export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
            node -v
            npm -v
            npm ci
            CI=false \
            GENERATE_SOURCEMAP=false \
            NODE_OPTIONS=--max-old-space-size=1024 \
            REACT_APP_SERVER_URL=/api \
            REACT_APP_AI_SERVER_URL=/ai-api \
            npm run build
            '''
        }
    }
}
```

### Jenkins React build가 ESLint warning 때문에 실패하는 경우

Jenkins Console Output에 아래 메시지가 나오면 React build 자체가 깨진 것이 아니라, Jenkins/CI 환경에서 warning을 error로 취급해서 중단된 것입니다.

```text
Treating warnings as errors because process.env.CI = true.
Failed to compile.
```

`no-unused-vars`, `react-hooks/exhaustive-deps`, `unicode-bom` 같은 항목이 함께 출력될 수 있습니다. 장기적으로는 해당 warning을 코드에서 정리하는 것이 좋지만, 배포 자동화 확인 단계에서는 Pipeline의 React build 명령에 `CI=false`를 명시해서 build를 통과시킬 수 있습니다. 작은 EC2에서는 sourcemap 생성도 메모리를 많이 쓰므로 `GENERATE_SOURCEMAP=false`를 같이 둡니다.

```groovy
stage('Build React') {
    steps {
        dir('react-frontend') {
            sh '''
            export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
            node -v
            npm -v
            npm ci
            CI=false \
            GENERATE_SOURCEMAP=false \
            NODE_OPTIONS=--max-old-space-size=1024 \
            REACT_APP_SERVER_URL=/api \
            REACT_APP_AI_SERVER_URL=/ai-api \
            npm run build
            '''
        }
    }
}
```

이 설정은 warning을 숨기는 임시 배포 설정에 가깝습니다. 배포가 안정화된 뒤에는 `unicode-bom`, 사용하지 않는 import/state, Hook dependency warning을 정리해서 `CI=true`에서도 통과하는 상태로 만드는 것을 권장합니다.

### Jenkins에서 docker-compose.prod.yml 파일이 없다고 실패하는 경우

Console Output에서 아래 오류가 나오면 React build와 frontend 배포까지는 성공했고, Docker Compose 단계에서 배포용 compose 파일을 찾지 못한 것입니다.

```text
open /opt/team1/current/docker-compose.prod.yml: no such file or directory
```

가장 흔한 원인은 `docker-compose.prod.yml`, `Dockerfile.backend`, `Dockerfile.ai`를 EC2에서만 수동으로 만들고 Git 배포 브랜치에는 commit/push하지 않은 경우입니다. Jenkins Pipeline은 Git checkout 결과를 `/opt/team1/current`에 `rsync --delete`로 동기화하므로, Git에 없는 파일은 `/opt/team1/current`에서 삭제될 수 있습니다.

EC2에서 현재 상태를 확인합니다.

```bash
cd /opt/team1/current
ls -lh docker-compose.prod.yml Dockerfile.backend Dockerfile.ai
```

해결 방법은 프로젝트 루트에 아래 파일들을 만들고 배포용 브랜치에 commit/push하는 것입니다.

```text
Dockerfile.backend
Dockerfile.ai
docker-compose.prod.yml
.dockerignore
```

그 다음 EC2 또는 Jenkins workspace에서 해당 브랜치를 다시 pull/checkout한 뒤 Jenkins `Build Now`를 다시 실행합니다.

Pipeline의 Docker Compose 단계에 아래 확인 명령을 넣어두면 같은 문제가 더 빨리 드러납니다.

```groovy
stage('Docker Compose Build & Up') {
    steps {
        sh '''
        cd $DEPLOY_DIR
        test -f docker-compose.prod.yml
        test -f Dockerfile.backend
        test -f Dockerfile.ai
        docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml build backend ai-server
        docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d
        '''
    }
}
```

### Dockerfile.backend에서 target jar를 찾지 못하는 경우

Console Output에 아래 오류가 나오면 Jenkins가 jar 빌드에는 성공했지만, Docker build context에서 `target/*.jar`를 보지 못한 것입니다.

```text
Dockerfile.backend:4
COPY target/*.jar app.jar
target backend: failed to solve: lstat /target: no such file or directory
```

가장 흔한 원인은 `.dockerignore`에 `target` 또는 `target/`을 통째로 제외해 둔 경우입니다. backend Dockerfile은 `target/*.jar`를 이미지 안으로 복사하므로 jar 파일은 예외 처리해야 합니다.

```dockerignore
target/*
!target/*.jar
```

수정 후 commit/push하고 Jenkins에서 다시 `Build Now`를 실행합니다.

### Jenkins Health Check에서 404, 502, 000으로 실패하는 경우

Console Output 흐름이 아래처럼 보이면 Docker 이미지 빌드, 컨테이너 재생성, Nginx reload까지는 성공한 상태입니다.

```text
Image current-ai-server Built
Image current-backend Built
Container team1-ai-server Started
Container team1-backend Started
nginx: configuration file /etc/nginx/nginx.conf test is successful
front=200 ai_direct=000 ai_nginx=502 backend=000
```

이 경우 가장 흔한 원인은 컨테이너는 시작됐지만 Spring Boot 또는 FastAPI 앱이 아직 완전히 준비되지 않은 상태에서 health check가 너무 빨리 실행된 것입니다. `docker ps`에서 `Up 7 seconds`처럼 매우 짧게 보이면 특히 가능성이 높습니다.

응답 코드 해석:

```text
front=404: HTTPS/server_name 적용 후 http://127.0.0.1/ 같은 잘못된 URL을 검사 중일 가능성
ai_direct=000: AI 컨테이너 포트가 아직 응답하지 않음. curl 자체가 연결 실패
ai_nginx=502: Nginx는 열렸지만 upstream AI 서버가 아직 준비되지 않음
backend=000: backend가 아직 시작 중이거나 포트가 열리지 않음
backend=401: /api/user/me를 토큰 없이 호출한 정상 응답. backend alive로 판단 가능
```

EC2에서 직접 확인합니다.

```bash
docker logs --tail=100 team1-ai-server
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1/ai-api/health
```

직접 호출(`:8000/health`)은 성공하는데 Nginx 경유(`/ai-api/health`)가 계속 실패하면 Nginx 설정을 확인합니다. 둘 다 잠시 후 성공한다면 Pipeline health check가 너무 빨랐던 것입니다.

Jenkins Pipeline의 Health Check 단계는 즉시 한 번만 검사하지 말고 재시도 방식으로 작성합니다. 또한 `curl`이 연결 실패로 non-zero exit code를 반환해도 루프가 중단되지 않도록 각 curl 뒤에 `|| true`를 붙입니다.

```groovy
stage('Health Check') {
    steps {
        sh '''
        docker ps
        for i in $(seq 1 60); do
          FRONT_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://43.200.198.243.sslip.io/ || true)
          AI_DIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health || true)
          AI_NGINX_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://43.200.198.243.sslip.io/ai-api/health || true)
          BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/api/user/me || true)

          echo "front=$FRONT_CODE ai_direct=$AI_DIRECT_CODE ai_nginx=$AI_NGINX_CODE backend=$BACKEND_CODE"

          if [ "$FRONT_CODE" = "200" ] \
            && [ "$AI_DIRECT_CODE" = "200" ] \
            && [ "$AI_NGINX_CODE" = "200" ] \
            && [ "$BACKEND_CODE" = "401" ]; then
            echo "Health check passed"
            exit 0
          fi

          echo "Waiting for services... ($i/60)"
          sleep 5
        done

        echo "Health check failed"
        docker ps
        docker logs --tail=100 team1-ai-server || true
        docker logs --tail=150 team1-backend || true
        exit 1
        '''
    }
}
```

### 배포 후 특정 관리자 페이지가 504 Gateway Time-out이 되는 경우

브라우저 콘솔이나 화면에 아래 오류가 나오면 Nginx가 upstream 서버(Spring Boot backend 또는 FastAPI AI server)의 응답을 제한 시간 안에 받지 못한 것입니다.

```text
504 Gateway Time-out
Failed to load resource: the server responded with a status of 504
```

`/admin/onboarding/documents` 같은 Spring MVC 관리자 화면에서 504가 나면 먼저 backend 컨테이너 상태와 로그를 봅니다.

```bash
docker ps
docker logs --tail=200 team1-backend
sudo tail -n 100 /var/log/nginx/error.log
free -h
docker stats --no-stream
```

Nginx를 거치지 않고 backend에 직접 요청해서 어디서 막히는지 비교합니다.

```bash
curl -i --max-time 10 http://127.0.0.1:8081/admin/onboarding/documents
curl -i --max-time 10 http://127.0.0.1/admin/onboarding/documents
curl -i --max-time 10 http://127.0.0.1/
```

판단 기준:

```text
127.0.0.1:8081 직접 호출도 느리거나 timeout -> backend 문제
127.0.0.1:8081 직접 호출은 빠른데 Nginx 경유만 504 -> Nginx 설정/timeout 문제
docker ps에서 backend가 Restarting 또는 Exited -> backend 로그 확인 후 재기동 필요
free -h에서 available memory가 매우 작고 swap 사용량이 높음 -> 메모리 부족 가능성
```

사이트 전체가 무한 로딩이면 우선 backend를 재기동해서 사용자 화면을 복구한 뒤 로그를 분석합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml restart backend
docker logs -f team1-backend
```

로그에 `Started Team1FinPjApplication`이 다시 보이면 브라우저에서 `/`, `/admin/home`, 문제가 된 `/admin/onboarding/documents`를 다시 확인합니다.

Nginx 설정에는 Spring MVC 관리자 페이지와 정적 리소스가 backend로 가도록 아래 location이 포함되어 있어야 합니다.

```nginx
location ~ ^/(admin|css|js|images|calendar|attendance|leave|test|approval/uploads|employee/uploads)(/|$) {
    proxy_pass http://127.0.0.1:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`/admin/onboarding/documents`에서 timeout이 나고 backend 로그에 아래 메시지가 보이면, 문서 목록 조회 중 Java heap이 부족해진 것입니다.

```text
[AdOnboardingController] - documentList()
java.lang.OutOfMemoryError: Java heap space
```

이 프로젝트에서는 `document` 수가 적어도 `doc_chunks`, `doc_vector`가 매우 많을 수 있습니다. 예를 들어 문서 22개에 청크/벡터가 40,682개인 경우, 목록 화면에서 `chunks.vector.embeddingData`까지 한 번에 로딩하면 backend가 OOM으로 멈출 수 있습니다.

DB 규모 확인:

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "select count(*) from document;"
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "select count(*) from doc_chunks;"
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "select count(*) from doc_vector;"
```

해결 방향:

```text
문서 목록 화면에서는 chunks.vector를 EntityGraph로 로딩하지 않음
chunk/vector 개수는 count 쿼리로 조회
주요 청크 미리보기는 문서당 앞쪽 몇 개 청크의 짧은 문자열만 조회
상세/처리/질의 로직은 기존처럼 필요한 경우에만 chunk/vector를 로딩
```

학습 상세 화면(`/onboarding/learning/{contentId}`)에서 AI에게 문서 내용을 질의할 때 아래처럼 500이 나도 같은 계열의 문제일 수 있습니다.

```text
POST /api/onboarding/dashboard/content/{contentId}/question 500
```

이 경우 backend 로그를 먼저 확인합니다.

```bash
docker logs --tail=200 team1-backend
docker logs --tail=200 team1-ai-server
```

질의 API도 연결 문서를 찾는 과정에서 `chunks.vector.embeddingData` 전체를 로딩하지 않아야 합니다. 해결 방향은 아래와 같습니다.

```text
contentId -> document 연결 조회는 chunks 없는 전용 쿼리 사용
질의용 chunk 후보는 doc_chunks에서 chunk_no, section_title, left(content, 2000) 정도만 조회
doc_vector.embedding_data는 질의 요청마다 Java heap에 올리지 않음
```

수정 후 자동 배포를 다시 실행하고 아래를 확인합니다.

```bash
curl -i --max-time 10 http://127.0.0.1:8081/admin/onboarding/documents
curl -i --max-time 10 http://127.0.0.1/admin/onboarding/documents
docker logs --tail=100 team1-backend
```

### 출근/퇴근 클릭 시 GPS 위치 정보가 없다고 나오는 경우

브라우저 콘솔에 아래 오류가 나오면 프론트엔드 코드나 backend API 문제가 아니라, 브라우저가 HTTP 배포 주소에서 Geolocation API 사용을 차단한 것입니다.

```text
Only secure origins are allowed
GeolocationPositionError code: 1
GPS 위치 정보가 없습니다.
```

브라우저의 Geolocation API는 보안 출처에서만 동작합니다.

```text
허용: https://도메인, http://localhost
차단: http://EC2_PUBLIC_IP
```

따라서 `http://43.200.198.243` 같은 HTTP IP 주소로 접속한 배포 환경에서는 출근/퇴근 GPS 기능이 정상 동작하지 않습니다. 통합테스트에서 출퇴근 기능까지 확인하려면 아래 중 하나를 선택합니다.

권장 방식: sslip.io + HTTPS 적용

```text
43.200.198.243.sslip.io처럼 EC2 탄력적 IP 기반 sslip.io 주소 사용
별도 DNS 설정 없이 해당 주소가 EC2 탄력적 IP를 가리키는지 확인
Nginx server_name을 sslip.io 주소로 변경
Let's Encrypt/Certbot 등으로 SSL 인증서 발급
https://43.200.198.243.sslip.io 로 접속해서 출근/퇴근 테스트
```

DuckDNS를 사용할 수도 있지만, Let's Encrypt 인증서 발급 중 아래 오류가 반복되면 DuckDNS DNS CAA 조회 타임아웃 문제일 가능성이 있습니다.

```text
DNS problem: query timed out looking up CAA for duckdns.org
```

이 경우 프리티어 시연에서는 DuckDNS 대신 `sslip.io`로 진행하는 것이 빠릅니다.

임시 테스트 방식: Chrome insecure origin 허용

```text
Chrome 실행 옵션에 아래 값을 추가해서 테스트 PC에서만 HTTP IP를 임시 허용
--unsafely-treat-insecure-origin-as-secure=http://EC2_PUBLIC_IP
```

이 방식은 개발/통합테스트용 임시 우회입니다. 팀원 각자 브라우저에 적용해야 하며, 운영 사용자에게 안내할 방식은 아닙니다.

확인 순서:

```text
1. https://43.200.198.243.sslip.io 또는 임시 허용된 브라우저로 접속
2. 주소창 왼쪽 사이트 설정에서 위치 권한 허용
3. 출근하기 클릭
4. 브라우저 콘솔에 Only secure origins are allowed가 사라졌는지 확인
5. backend가 회사 반경 검증을 통과하는지 확인
```

GPS 권한이 정상으로 바뀐 뒤에도 실패한다면 그때는 backend의 회사 위치/허용 반경 검증 문제일 수 있습니다. backend 기준 위치는 `AttendanceServiceImpl`의 `COMPANY_LAT`, `COMPANY_LNG`, `ALLOWED_DISTANCE_METER` 값을 확인합니다.

### GitHub Webhook 자동 배포가 실행되지 않는 경우

GitHub에 push했는데 Jenkins 자동 배포가 실행되지 않으면 먼저 GitHub webhook의 최근 전송 결과를 확인합니다.

```text
GitHub repository
-> Settings
-> Webhooks
-> 등록한 webhook 클릭
-> Recent Deliveries 확인
```

프리티어 시연 기준 Payload URL:

```text
https://43.200.198.243.sslip.io/github-webhook/
```

아래처럼 예전 HTTP IP 주소로 되어 있으면 수정합니다.

```text
잘못된 예: http://43.200.198.243/github-webhook/
권장 예: https://43.200.198.243.sslip.io/github-webhook/
```

`Invalid HTTP Response: 404`가 나오면 대부분 Nginx가 `/github-webhook/` 경로를 Jenkins로 넘기지 못한 상태입니다. Nginx HTTPS server block 안에 아래 location이 있는지 확인합니다.

```bash
sudo nano /etc/nginx/sites-available/team1
```

```nginx
location /github-webhook/ {
    proxy_pass http://127.0.0.1:8080/github-webhook/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

수정 후 적용합니다.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

EC2에서 webhook 경로가 Jenkins까지 전달되는지 확인합니다.

```bash
curl -i https://43.200.198.243.sslip.io/github-webhook/
```

정상적으로 Jenkins까지 연결되면 `GET` 요청 기준으로는 `405 Method Not Allowed`가 나올 수 있습니다. 이 경우는 실패가 아니라, Jenkins webhook endpoint가 GitHub의 `POST` 요청을 받는 경로이기 때문에 자연스러운 응답입니다.

정상 연결의 단서:

```text
HTTP/1.1 405 Method Not Allowed
X-Jenkins: 2.555.2
```

즉 아래처럼 판단합니다.

```text
404: Nginx location 또는 webhook URL 문제 가능성이 큼
405 + X-Jenkins 헤더: Nginx가 Jenkins까지 정상 프록시 중. GitHub POST 재전송 필요
```

GitHub에서 같은 payload를 다시 보내려면 `Redeliver`를 사용합니다.

```text
GitHub repository
-> Settings
-> Webhooks
-> 등록한 webhook 클릭
-> Recent Deliveries
-> 실패한 delivery 클릭
-> Redeliver 클릭
```

`Redeliver` 후 GitHub 응답 코드가 `200`인지 확인하고, Jenkins의 `Build History`에 새 빌드가 생기는지 확인합니다.

Jenkins job 설정도 함께 확인합니다.

```text
Jenkins job
-> Configure
-> Build Triggers
-> GitHub hook trigger for GITScm polling 체크
```

Pipeline이 특정 브랜치만 빌드하도록 되어 있다면 push한 브랜치와 설정 브랜치가 일치해야 합니다.

```text
예: */topic/aws_test
```

GitHub 화면에서 `Redeliver`를 찾기 어렵다면 테스트용 빈 커밋으로 webhook을 다시 발생시킬 수 있습니다.

```bash
git commit --allow-empty -m "Test webhook deployment"
git push
```

### Docker build 중 no space left on device가 나는 경우

아래 오류는 Docker 이미지 빌드 마지막 단계에서 EC2 디스크 또는 Docker 저장소(`/var/lib/docker`) 공간이 부족하다는 뜻입니다.

```text
failed to solve: failed to extract layer ...
no space left on device
```

먼저 디스크와 Docker 사용량을 확인합니다.

```bash
df -h
docker system df
```

안 쓰는 Docker build cache와 dangling image를 정리합니다.

```bash
docker builder prune -f
docker image prune -f
```

그래도 부족하면 사용하지 않는 Docker 이미지, 중지된 컨테이너, build cache를 한 번에 정리합니다.

```bash
docker system prune -af
```

주의: DB 데이터가 들어 있는 Docker volume은 삭제하면 안 됩니다. 아래 명령은 운영/배포 테스트 DB를 날릴 수 있으므로 실행하지 않습니다.

```bash
docker volume prune
docker compose down -v
```

OS 패키지 캐시와 오래된 journal 로그도 정리할 수 있습니다.

```bash
sudo apt clean
sudo journalctl --vacuum-time=7d
```

위 정리 후에도 공간이 부족하면 EC2 EBS 볼륨 크기를 늘린 뒤 Ubuntu에서 파티션/파일시스템 확장을 진행해야 합니다.

#### EBS 용량을 추가 구매해서 확장하는 방법

현재처럼 Docker AI 서버 이미지 빌드가 `no space left on device`로 반복 실패하면 루트 EBS 볼륨을 늘리는 것이 가장 확실합니다. 우리 프로젝트 기준으로는 최소 50GB, 여유 있게는 60GB 이상을 권장합니다.

현재 용량과 사용량은 EC2에서 확인합니다.

```bash
df -h
docker system df
lsblk
```

AWS Console에서 EBS 볼륨을 확장합니다.

```text
1. AWS Console 접속
2. EC2 -> Instances -> 현재 인스턴스 선택
3. Storage 탭 -> Root volume 클릭
4. EBS Volumes 화면에서 해당 volume 선택
5. Actions -> Modify volume
6. Size를 50 또는 60 GiB 등으로 변경
7. Type은 gp3 유지
8. IOPS/Throughput은 기본값 유지
9. Modify 클릭
```

AWS에서 볼륨 크기를 늘린 뒤, Ubuntu 안에서 파티션과 파일시스템을 확장합니다. 먼저 루트 파티션을 확인합니다.

```bash
lsblk
df -Th /
```

예를 들어 `/`가 `/dev/nvme0n1p1`에 붙어 있다면 다음처럼 실행합니다.

```bash
sudo growpart /dev/nvme0n1 1
sudo resize2fs /dev/nvme0n1p1
df -h
```

인스턴스에 따라 디바이스 이름은 `/dev/xvda1`처럼 다를 수 있습니다. `lsblk`에서 `/`가 붙어 있는 파티션을 기준으로 명령을 맞춥니다.

참고 자료: [AWS EC2 인스턴스 용량 확장](https://velog.io/@harvey/AWS-EC2-%EC%9D%B8%EC%8A%A4%ED%84%B4%EC%8A%A4-%EC%9A%A9%EB%9F%89-%ED%99%95%EC%9E%A5). 이 글도 EBS 볼륨 확장과 Linux 파일 시스템 확장의 두 단계로 설명합니다.

과금은 EBS의 프로비저닝한 GB/월 기준입니다. AWS Free Tier에는 일반적으로 EBS 30GB가 포함되므로, 50GB로 늘리면 초과분 약 20GB, 60GB로 늘리면 초과분 약 30GB에 대해 월 과금이 발생한다고 보면 됩니다. 정확한 금액은 리전, EBS 타입, 환율, 세금에 따라 달라지므로 AWS Pricing Calculator에서 `Amazon EBS`, 리전 `Asia Pacific (Seoul)`, 타입 `gp3`, 용량 `50GB` 또는 `60GB`로 계산합니다.

### PostgreSQL init SQL이 다시 실행되지 않는 경우

`/docker-entrypoint-initdb.d`는 PostgreSQL 데이터 볼륨이 처음 생성될 때만 실행됩니다. 이미 볼륨이 있으면 수동 복원을 사용합니다.

```bash
docker cp backup.sql team1-postgres:/tmp/backup.sql
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -f /tmp/backup.sql
```

### 새 backup.sql로 EC2 DB를 교체하고 싶은 경우

DBeaver 등에서 DB 컬럼 타입을 수정한 뒤 새 dump backup을 만들었다면, EC2의 기존 `backup.sql`을 새 파일로 교체하고 PostgreSQL 컨테이너에 다시 복원합니다.

먼저 기존 파일을 보관합니다.

```bash
mv /home/ubuntu/backup.sql /home/ubuntu/backup.old.sql
```

MobaXterm SFTP 패널로 새 dump 파일을 아래 경로에 업로드합니다.

```text
/home/ubuntu/backup.sql
```

업로드 확인:

```bash
ls -lh /home/ubuntu/backup.sql
```

DB를 다시 복원하는 동안 backend가 DB에 접속하지 않도록 잠시 중지합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml stop backend
```

새 dump 파일을 PostgreSQL 컨테이너 안으로 복사합니다.

```bash
docker cp /home/ubuntu/backup.sql team1-postgres:/tmp/backup.sql
```

기존 DB를 삭제하고 새로 만듭니다. 배포 테스트 환경 기준이며, 기존 EC2 DB 내용은 삭제됩니다.

```bash
docker exec -it team1-postgres psql -U postgres -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'ict06_team1_finalpj'
  AND pid <> pg_backend_pid();
"

docker exec -it team1-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS ict06_team1_finalpj;"
docker exec -it team1-postgres psql -U postgres -d postgres -c "CREATE DATABASE ict06_team1_finalpj;"
```

현재 우리 팀 dump 파일처럼 PostgreSQL custom-format dump라면 `pg_restore`를 사용합니다.

```bash
docker exec -it team1-postgres pg_restore \
  -U postgres \
  -d ict06_team1_finalpj \
  --verbose \
  /tmp/backup.sql
```

일반 plain SQL dump라면 아래처럼 `psql -f`를 사용합니다.

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -f /tmp/backup.sql
```

복원 확인:

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "\dt"
```

특정 컬럼 타입 변경을 반영한 dump라면 해당 컬럼도 확인합니다. 예를 들어 `employee.is_deleted`를 `varchar(1)`로 바꾼 경우:

```bash
docker exec -it team1-postgres psql -U postgres -d ict06_team1_finalpj -c "
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'employee'
  AND column_name = 'is_deleted';
"
```

backend를 다시 기동합니다.

```bash
cd /opt/team1/current
docker compose --env-file /opt/team1/.env -f docker-compose.prod.yml up -d --force-recreate backend
docker logs -f team1-backend
```

아래 로그가 나오면 정상 기동입니다.

```text
Started Team1FinPjApplication
```

추후 빈 PostgreSQL 볼륨에서 초기 복원용으로 사용할 파일도 교체해둡니다.

```bash
sudo cp /home/ubuntu/backup.sql /opt/team1/db/init/01_backup.sql
sudo chown root:root /opt/team1/db/init/01_backup.sql
sudo chmod 644 /opt/team1/db/init/01_backup.sql
```

단, custom-format dump는 `/docker-entrypoint-initdb.d`에서 자동 실행되지 않습니다. custom-format dump는 위 절차처럼 `pg_restore`로 복원합니다.

## 21. 최종 배포 순서 요약

```text
1. EC2 보안그룹 설정
2. MobaXterm으로 EC2 SSH 접속
3. Ubuntu 패키지, Docker, Jenkins, Nginx 설치
4. Jenkins Java 21 실행 설정 및 JDK 17 빌드 설정 확인
5. /opt/team1 디렉터리 준비
6. backend.env, ai.env, /opt/team1/.env 작성
7. DB dump SQL 업로드
8. Dockerfile.backend, Dockerfile.ai, docker-compose.prod.yml 준비
9. Nginx sites-available/team1 설정
10. Jenkins Pipeline 등록
11. Jenkins 빌드 실행
12. PostgreSQL 복원 확인
13. Docker 컨테이너 상태 확인
14. Nginx reload
15. 브라우저에서 http://EC2_PUBLIC_IP 접속 및 로그인 테스트
16. 운영 DB 백업 스케줄 등록
```
