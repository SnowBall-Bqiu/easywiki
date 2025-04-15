# API文档

## 用户认证

### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

响应示例:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

## 数据接口
> 弹性计费默认关闭，当月超出套餐流量后会无法下载文件。
开启弹性计费后，超出套餐流量后会自动按照超出流量的价格进行扣费，不会影响存储桶的正常使用。
价格：超出套餐后流量价格为0.5元/GB
### 获取文档列表
```http
GET /api/docs
Authorization: Bearer <token>
```

### 获取文档内容
```http
GET /api/docs/:id
Authorization: Bearer <token>
```

## 错误代码

| 代码 | 描述 |
|------|------|
| 401 | 未授权 |
| 404 | 文档不存在 |
| 500 | 服务器错误 |