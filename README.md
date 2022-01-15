# Movie-API

This is a books API I've made as a test task

<h2>To run this app you will need to create config.env file in root dir.</h2>

```
NODE_ENV=development
PORT=3000

DATABASE=your_mongodb_connection_link

JWT_SECRET=your_super_extremely_enormously_secret_key
JWT_EXPIRES_IN=90d
```

<h2>To run test create test.env file in root dir, make sure to change DB link to test one.</h2>

```
PORT=4000

DATABASE=your_test_mongodb_connection_link

JWT_SECRET=your_super_extremely_enormously_secret_key
JWT_EXPIRES_IN=90d
```

<h2>After that you can start the app</h2>

```
npm i
npm start
```

<h2>API documentation</h2>

```
https://documenter.getpostman.com/view/17965363/UVXjKbtn
```

<h2>Also its live on heroku</h2>

```
https://livebooksapi.herokuapp.com/
```
