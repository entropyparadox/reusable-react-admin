# reusable-react-admin

Martian 팀의 React Admin 프로젝트에 재활용 가능한 유틸리티들을 모아둔 라이브러리 입니다.

## Getting Started

### 프로젝트 생성

1. GitHub 에 빈 리포지토리를 생성하고 로컬에 클론 받는다.

2. [Create React App](https://create-react-app.dev) 타입스크립트 템플릿 사용. 프로젝트 루트 경로로 이동하여 다음 명령어를 실행한다.

```
npx create-react-app . --template typescript
```

3. 프로젝트 루트 경로에 `.prettierrc` 파일을 생성하고 아래 내용을 입력한다.

```
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

4. 프로젝트 루트 경로에 .env 와 .env.example 파일을 생성하고 다음 내용으로 채워준다.

```
REACT_APP_API_URL=http://localhost:8001
```

5. `.gitignore` 파일에 다음 내용을 추가한다.

```
.env
.eslintcache
```

### React Admin 세팅

1. 아래 명령어를 입력하여 필요한 패키지들을 설치한다.

```
npm i react-admin
```

### reusable-react-admin 세팅

1. GitHub [Settings](https://github.com/settings/profile) > [Developer settings](https://github.com/settings/apps) > [Personal access tokens](https://github.com/settings/tokens) 에서 Generate new token 버튼을 눌러 토큰을 생성한다. 토큰을 생성할 때 `write:packages` 체크박스를 선택한다. 생성된 토큰을 클립보드에 복사한다.

2. `~/.npmrc` 파일에 다음 내용을 추가한다. `TOKEN` 자리에 복사한 토큰을 넣는다.

```
//npm.pkg.github.com/:_authToken=TOKEN
```

3. 다음 명령어를 입력하여 로그인한다. 로그인할때 패스워드는 복사한 토큰을 그대로 사용한다.

```
npm login --scope=@entropyparadox --registry=https://npm.pkg.github.com
```

4. 다음 명령어를 이용하여 패키지를 설치한다.

```
npm i @entropyparadox/reusable-react-admin
```

5. App.tsx 파일의 App 컴포넌트를 아래 처럼 작성한다.

```
function App() {
  const [dataProvider, setDataProvider] = useState<ReusableDataProvider>();
  useEffect(() => {
    ReusableDataProvider.create().then((reusableDataProvider) =>
      setDataProvider(reusableDataProvider),
    );
  }, []);

  if (!dataProvider) return <></>;
  return (
    <Admin authProvider={reusableAuthProvider} dataProvider={dataProvider}>
      <Resource name="users" list={UserList} edit={UserEdit} />
    </Admin>
  );
}
```
