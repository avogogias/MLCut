# A script which reads data from a transposed CSV file (HOX424_trans),
# then calculates distances with R.TSclust package,
# then calculates dendrogram with R.hclust package,
# then converts the dendrogram to a JSON format that D3 can read from,
# and finally exports the .json file (HOX424.json) 

# Here set the .csv filename before running the script
filename = "DE_FC_HX_Cb_ID" 

library(TSclust) # The diss() method for time-series data
#library(hclust) # The dist() method is for static data and not time-series 
#library(vegan)  # The vegdist() method has additional distance metrics to hclust including Jaccard's
library(rjson)    # Transform R dendrogram to JSON format
#library(dendsort) # Sort branches in a monotonous way for better vis of clusters
#library(discretization) #  Convert continuous variables into discrete variables
#library(infotheo) # Includes discretize() function  - other package is 'arules'

data = read.csv(paste0(filename, ".csv"), header = TRUE)

# HOWTO transpose and manipulate data matrix within R
# TV data <- data[c(-1, -2),] # Exclude the first two rows (MIN and MAX) from the transpose
# TV n <- data$NAME # Store names separatelly. Otherwise numerics will become Strings while transforming.
n <- data$ID # Store names separatelly. Otherwise numerics will become Strings while transforming.
#data <- as.data.frame(t(data[,-1])) # Exclude the names from the transpose.
data <- data[, -1] # Exclude the names
data <- as.data.frame(t(data)) # Transpose!
colnames(data) <- n # add names later
#tsdist <- diss(data, "ACF", p=0.05)
#tsdist <- diss(data, "ACF")
tsdist <- diss(data, "EUCL") 
#tsdist <- diss(data, "DTWARP")
#tsdist <- vegdist(t(data), method="jaccard") # Maybe I have to transpose the matrix first to use that NON time-series metric
hc <- hclust(tsdist,method="average")
#plot(hc)
#hc <- dendsort(hc, isReverse = FALSE, type = "min")
#plot(hc)
range01 <- function(x){(x-min(x))/(max(x)-min(x))} # Scale dissimilarities (heights) between 0 and 1
hc$height <- range01(hc$height)

plot(hc)

#convert output from hclust into a nested JSON file
HCtoJSON<-function(hc){
  labels<-hc$labels
  heights<-hc$height
  merge<-data.frame(hc$merge)
  for (i in (1:nrow(merge))) {
    if (merge[i,1]<0 & merge[i,2]<0) {eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", similarity=1-heights[i], children=list(list(name=labels[-merge[i,1]]),list(name=labels[-merge[i,2]])))")))}
      else if (merge[i,1]>0 & merge[i,2]<0) {eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", similarity=1-heights[i], children=list(node", merge[i,1], ", list(name=labels[-merge[i,2]])))")))}
      else if (merge[i,1]<0 & merge[i,2]>0) {eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", similarity=1-heights[i], children=list(list(name=labels[-merge[i,1]]), node", merge[i,2],"))")))}
      else if (merge[i,1]>0 & merge[i,2]>0) {eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", similarity=1-heights[i], children=list(node",merge[i,1] , ", node" , merge[i,2]," ))")))}
  }
  eval(parse(text=paste0("JSON<-toJSON(node",nrow(merge), ")")))
  return(JSON)
}

JSON<-HCtoJSON(hc)

#write(JSON, file = "OV1002CT.json")
write(JSON, file = paste0(filename, ".json"))

