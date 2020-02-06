# jbfreels.com

## technologies

### Hugo
I'm using Hugo to build the site.  Hugo is a wicked fast framework for building websites.  

### Hugo template
***[LoveIt](https://github.com/dillonzq/LoveIt)*** theme is what I'm currently using.  

```zsh
git clone https://github.com/dillonzq/LoveIt themes/LoveIt
```

### build
`HUGO_ENV=production hugo server -D`

#### s3 deploy
Makefile added which allows you to `build-production` and `deploy`
