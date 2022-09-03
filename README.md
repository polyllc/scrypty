# scrypty
 universal repository installer & runner

# features
 so far, not too many,
 it can:
 - install most sln/visual studio programs
 - install most cmake + visual studio programs
 - install most c++ (from single file compiles) programs
 - install some c files 
 - install some go files
 - install gradle (through ./gradlew build)
 - install by custom commands
 - install from most scrypty files
 ---
 ## planned 
- make       compile by make
- singlejava compile only one file, java
- gradle     compile by gradle
- maven      compile by maven 
- yarn       compile by yarn
- npm        compile by npm (either by npm install in wdir or asking the user if they know that the package is available on npm already) (find package.json)
- nmakevs    compile by visual studio's nmake
- meson      compile by meson
- ninja      compile by ninja
- autocustom compile by instructions found in readme (if all else fails!)

also planned is that it will automatically install the compilers, so you don't have to,
oh and these things too:
 - delete repositories
 - reinstall repositories (for updates)
 - some web app thing for a gui
 - probably a website where you can just download scrypty files and it'll just install correctly the first time around
 ---
# how to use
 pretty simple, install the latest version of node.js, clone the repository (by downloading as zip or cloning with git), go to the folder where the file `package.json` is in, get in a command line, type in `npm install`, and then to run it, use `node scrypty.js {github link}`, where {github link} is the repository you're trying to install. 
 make sure you have all the compilers already installed
