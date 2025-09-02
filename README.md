# Git merging & conflicts resolution showcase

## Steps

1. `git chekout main`
1. `git pull`
1. `git checkout feature/FEAT1-rename-endpoints`
1. `git pull`
1. `git merge main`





2. `git chekout main`
3. `git pull`
4. `git merge feature/FEAT1-rename-endpoints`
5. (See in github that there are conflicts for other branches)


6. `git checkout feature/FEAT2-better-endpoint-names`
7. `git pull`
8. `git chekout main`
9.  `git pull`
10. `git merge feature/FEAT2-better-endpoint-names`
11. Conflicts!
    1. resolve conflicts and `git commit`
    2. OR abort merge with `git merge --abort`
12. repeat with `feature/FEAT3-post-likes`