AWS := aws --profile jbfreels
HUGO := hugo
PUBLIC_FOLDER := public/
S3_BUCKET = s3://jbfreels.com/
CLOUDFRONT_ID := E3LYLRNW15DPU6
DOMAIN = jbfreels.com
SITEMAP_URL = https://jbfreels.com/sitemap.xml

DEPLOY_LOG := deploy.log

.ONESHELL:

build-production:
	HUGO_ENV=production $(HUGO)

deploy: build-production
	echo "copying to server..."
	$(AWS) s3 sync $(PUBLIC_FOLDER) $(S3_BUCKET) --size-only --delete | tee -a $(DEPLOY_LOG)
	grep "upload\|delete" $(DEPLOY_LOG) | sed -e "s|.*upload.*to $(S3_BUCKET)|/|" | sed -e "s|.*delete: $(S3_BUCKET)|/|" | sed -e 's/index.html//' | sed -e 's/\(.*\).html/\1/' | tr '\n' ' ' | xargs $(AWS) cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths
	curl --silent "http://www.google.com/ping?sitemap=$(SITEMAP_URL)"
	curl --silent "http://www.bing.com/webmaster/ping.aspx?siteMap=$(SITEMAP_URL)"

aws-cloudfront-invalidate-all:
	$(AWS) cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths "/*"

server:
	HUGO_ENV=production $(HUGO) server -D