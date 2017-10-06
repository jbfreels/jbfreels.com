# jbfreels.com

## technologies

### hugo
I'm using Hugo to build the site.  Hugo is a wicked fast framework for building websites.  

### hugo template
`Hugo Identity` theme is what I'm currently using for the landing page. 

```
git clone https://github.com/aerohub/hugo-identity-theme themes/hugo-identity-theme
```

### build
Make sure you have the theme cloned in `themes/hugo-identity-theme`

`hugo server -D`

### misc
I've included a `.htaccess` file to force SSL.  If you're having issues and don't want this functionality, or maybe your host does it differently, just remove the `.htaccess` file in `static/`.

