#!/bin/sh

cd "$(dirname "$0")"

# 1. Build the project
npm run build

# 2. Create a temp folder
rm -rf temp
mkdir temp

# 3. Copy the .git folder to the temp folder
cp -r .git temp

# 4. Checkout the gh-pages branch
cd temp
if [[ -z "$(git branch --list gh-pages)" ]]; then
  git checkout --orphan gh-pages
else
  git checkout gh-pages
fi

# 5. Remove all files except .git folder
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} \;

# 6. Copy the build files to the temp folder
cp -r ../dist/* .

# 7. Commit and push the changes
git add .
git commit -m "Deploy to gh-pages"
git push origin gh-pages

# 8. Go back to the previous branch
cd ..

# 9. Remove the temp folder
rm -rf temp
