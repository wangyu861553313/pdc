# Vitest TextEncoder 错误故障排除指南

## 错误信息

```
Error: Invariant violation: "new TextEncoder().encode("") instanceof Uint8Array" is incorrectly false
```

## 已实施的修复

### 1. TextEncoder/TextDecoder Polyfill

已在 `vitest.setup.ts` 中添加了 polyfill，确保在任何其他代码执行之前设置。

### 2. Vitest 配置优化

- 使用单线程模式 (`singleThread: true`)
- 禁用线程隔离 (`isolate: false`)
- 禁用依赖优化器 (`deps.optimizer.web.enabled: false`)

## 如果问题仍然存在，请尝试以下方案

### 方案 1: 检查 Node.js 版本

```bash
node --version
```

确保使用 Node.js 18+ 版本。如果版本过低，请升级：

```bash
# 使用 nvm (如果已安装)
nvm install 18
nvm use 18
```

### 方案 2: 清除缓存并重新安装

```bash
# 删除 node_modules 和锁文件
rm -rf node_modules
rm -rf pnpm-lock.yaml

# 清除 vitest 缓存
rm -rf node_modules/.vite
rm -rf node_modules/.vitest

# 重新安装
pnpm install
```

### 方案 3: 更新依赖版本

```bash
# 更新 vitest 和 jsdom
pnpm add -D vitest@latest jsdom@latest @vitest/coverage-v8@latest
```

### 方案 4: 使用不同的测试池

在 `vitest.config.ts` 中尝试使用 `forks` 池：

```typescript
test: {
  pool: 'forks',
  poolOptions: {
    forks: {
      singleFork: true,
    },
  },
  // ... 其他配置
}
```

### 方案 5: 完全禁用 esbuild 优化

在 `vitest.config.ts` 中添加：

```typescript
test: {
  // ... 其他配置
  deps: {
    inline: ['@reduxjs/toolkit'], // 内联某些依赖
    optimizer: {
      web: {
        enabled: false,
      },
      ssr: {
        enabled: false,
      },
    },
  },
}
```

### 方案 6: 使用环境变量

在运行测试前设置环境变量：

```bash
# Windows PowerShell
$env:NODE_OPTIONS="--no-warnings"
pnpm test

# Windows CMD
set NODE_OPTIONS=--no-warnings && pnpm test

# Linux/Mac
NODE_OPTIONS="--no-warnings" pnpm test
```

### 方案 7: 检查是否有冲突的全局设置

检查是否有其他配置文件（如 `.env` 文件）可能影响测试环境。

### 方案 8: 使用不同的测试环境

如果 jsdom 环境持续有问题，可以尝试使用 `happy-dom`：

```bash
pnpm add -D happy-dom
```

然后在 `vitest.config.ts` 中：

```typescript
test: {
  environment: 'happy-dom', // 替代 jsdom
  // ... 其他配置
}
```

### 方案 9: 检查是否有其他测试文件正常工作

运行其他测试文件，确认是特定文件的问题还是全局配置问题：

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test src/pages/Table/index.test.tsx
```

### 方案 10: 查看详细错误信息

使用 `--reporter=verbose` 获取更详细的错误信息：

```bash
pnpm test -- --reporter=verbose
```

## 当前配置摘要

- ✅ TextEncoder/TextDecoder polyfill 已设置
- ✅ 单线程模式已启用
- ✅ 依赖优化器已禁用
- ✅ 测试文件已添加 `@vitest-environment jsdom` 注释

## 如果以上方案都不起作用

1. **检查项目依赖冲突**：

   ```bash
   pnpm list vitest jsdom @vitest
   ```

2. **查看完整的错误堆栈**：运行测试时添加 `--no-coverage` 和 `--reporter=verbose`

3. **尝试最小化测试**：创建一个最简单的测试文件，确认问题是否与特定代码有关

4. **检查 GitHub Issues**：
   - [Vitest Issues](https://github.com/vitest-dev/vitest/issues)
   - [jsdom Issues](https://github.com/jsdom/jsdom/issues)

## 联系支持

如果问题持续存在，请提供以下信息：

- Node.js 版本
- pnpm 版本
- vitest 版本
- jsdom 版本
- 完整的错误堆栈
- 操作系统信息
