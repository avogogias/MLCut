Instructions:

1. Clone MLCut (if you use a web server save it in a web directory otherwise look at ** below)
2. Edit the "scripts/CSV-TSclust-hclust-rjson.r" file to point to your own CSV data file. Note that the first column that contains the names/ids of your data should be named "ID". Column names of the measurement could be anything you like. 
3. Execute the R script.  The output will be stored in a JSON file which together with the original CSV file will be used as input to MLCut. 
4. Edit the PATH_TO_JSON and PATH_TO_CSV variables in the first lines of "mlcut.js" to match the path and file names of your own .csv and .json data files
5. Access index.html with your web browser **

--

** How to configure Chrome so that it allows XMLHttpRequest (file access from files) in the case you don't run a local web server:
  a) Create a Shortcut for Chrome  
  b) Right Click on Shortcut icon  
  c) Select Properties 
  d) Select Shortcut tab  
  e) Add "--allow-file-access-from-files" flag on Target input 
     e.g. Target: "C:\Program Files (x86)\Google\Chrome\chrome.exe" --allow-file-access-from-files 
  f) -> Click Apply -> Click OK
  g) Open index.html using the Chrome shortcut

--

Find our paper in: https://diglib.eg.org/handle/10.2312/cgvc20161288


