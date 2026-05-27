# Chest Renewal Draft — Project Context

## 작업 디렉토리
```
D:\00_WORK_2026\Chest_Renewal_2026\chest_website_2026
```

## Figma 연동

### 파일 정보
- **파일명**: Chest_Renewal_2026
- **File Key**: `bFeIU9YmZEucE2GpgBWbtD`
- **URL**: https://www.figma.com/design/bFeIU9YmZEucE2GpgBWbtD/Chest_Renewal_2026
- **Variables 컬렉션**:
  - `Palette` (VariableCollectionId:1:2) — 원시 색상 토큰
  - `Colors` (VariableCollectionId:8:11947) — 시맨틱 토큰 (Palette alias 참조)

### 동기화 대상 파일
```
src/styles/theme.css
```

### 동기화 방법
사용자가 "theme.css 동기화해줘" 또는 "피그마 변수 업데이트해줘" 라고 요청하면:

1. Figma MCP(`mcp__bf42e1dc-e02d-4abd-9cf4-3d5204010143__use_figma`)로 변수 재조회
2. 아래 코드로 모든 변수와 resolved hex 값을 추출

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();

function toHex(c) {
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  const a = c.a === 1 ? '' : Math.round(c.a * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}${a}`;
}
const varMap = {};
for (const v of variables) varMap[v.id] = v;

function resolveColor(v, modeId) {
  const val = v.valuesByMode[modeId] || Object.values(v.valuesByMode)[0];
  if (!val) return null;
  if (val.type === 'VARIABLE_ALIAS') {
    const target = varMap[val.id];
    if (!target) return null;
    return resolveColor(target, Object.keys(target.valuesByMode)[0]);
  }
  return toHex(val);
}

const result = {};
for (const col of collections) {
  const vars = variables.filter(v => v.variableCollectionId === col.id);
  result[col.name] = vars.map(v => ({
    name: v.name,
    hex: resolveColor(v, col.defaultModeId)
  }));
}
return JSON.stringify(result, null, 2);
```

3. 결과를 `src/styles/theme.css`에 반영 (`:root { }` 구조 유지)
   - `Palette` → `--palette-{color}-{step}` 형식
   - `Colors` → `--color-{group}-{step}` 형식
   - 기존에 없던 변수는 추가, 삭제된 변수는 제거, 값이 바뀐 변수는 업데이트

## 프로젝트 스택
- Vanilla JS
