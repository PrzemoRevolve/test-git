# Git merging & conflicts resolution showcase

## Steps

1. `git chekout main`
1. `git pull`
1. `git checkout feature/FEAT1-rename-endpoints`
1. `git pull`






1. 
1. `git merge main`
1. `git chekout main`
1. `git pull`











1. `git merge feature/FEAT1-rename-endpoints`
1. (See in github that there are conflicts for other branches)
1. `git checkout feature/FEAT2-better-endpoint-names`
1. `git pull`
1. `git chekout main`
1. `git pull`
1. `git merge feature/FEAT2-better-endpoint-names`
1. Conflicts!
    1. resolve conflicts and `git commit`
    1. OR abort merge with `git merge --abort`
1. repeat with `feature/FEAT3-post-likes`