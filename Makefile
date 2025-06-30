# Makefile for Hugo blog automation

HUGO = hugo

.PHONY: serve new publish build

# Serve locally with drafts
serve:
	$(HUGO) server -D

# Create a new post: make new name=my-post
new-ctf:
	$(HUGO) new ctf/$(name).md

new-project:
	$(HUGO) new project/$(name).md
	
# Build the site locally
build:
	$(HUGO) --minify

# Commit and push changes
publish:
	git add .
	git commit -m "Publish site update"
	git push origin main
