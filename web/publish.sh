# 服务器构建出错时转为本地构建使用
# 清空缓存
rm -rf ./dist;
git add .;
git commit -m 'chore: 清空缓存';

# 更新版本
npm run build;
git add .;
git commit -m 'chore: 更新版本';
git push;

echo '发布完成';