# Template Designer Setup

## 1) Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## 2) Environment

Backend `.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/multischool
JWT_ACCESS_SECRET=replace_access_secret
JWT_REFRESH_SECRET=replace_refresh_secret
FRONTEND_URL=http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 3) Run

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

## 4) Access

- Template Manager: `/templates`
- Designer: `/templates/designer`
- Template details: `/templates/:id/details`
- Template versions: `/templates/:id/versions`
- Template preview: `/templates/:id/preview`

## 5) API

- OpenAPI file: `backend/src/docs/templates.openapi.json`
- Postman collection: `postman/Templates.postman_collection.json`
