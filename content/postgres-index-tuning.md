# PostgreSQL 인덱스 튜닝 기초 (샘플)

> ⚠️ 이 글은 UI/필터 시연을 위한 **샘플 콘텐츠**입니다.

## 언제 인덱스를 고려하나

- 자주 실행되는 쿼리의 `WHERE`, `JOIN`, `ORDER BY`에 등장하는 컬럼
- 카디널리티가 높은(값이 다양한) 컬럼일수록 효과가 큼

## 인덱스 종류 빠른 정리

| 종류 | 쓰임새 |
|------|--------|
| B-tree | 등호·범위 조건의 기본값 |
| 부분(Partial) | 특정 조건 행만 인덱싱해 크기 절감 |
| 복합(Composite) | 다중 컬럼 조건, 선두 컬럼 순서가 중요 |

## 병목 찾기

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC;
```

`Seq Scan`이 큰 테이블에서 보이면 인덱스 후보입니다. 인덱스 추가 후 `Index Scan`으로 바뀌는지, 실행 시간이 줄었는지 확인하세요.
