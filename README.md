# jbfreels.com

## technologies

### hugo
I'm using Hugo to build the site.  Hugo is a wicked fast framework for building websites.  

### hugo template
***LoveIt*** theme is what I'm currently using for the landing page. 

```
git clone https://github.com/dillonzq/LoveIt themes/LoveIt
```

### build
Make sure you have the theme cloned in `themes/`

`hugo server -D`

### misc
I've included a `.htaccess` file to force SSL.  If you're having issues and don't want this functionality, or maybe your host does it differently, just remove the `.htaccess` file in `static/`.

### deploy
`hugo && rsync -avz public/ jbfreels.com:~/jbfreels.com/

#### s3 deploy
`aws s3 sync public/ s3://jbfreels.com/ --size-only --delete`

`aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths "/*"`