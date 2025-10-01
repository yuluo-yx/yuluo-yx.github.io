# Common

# Log the running target
LOG_TARGET = echo -e "\033[0;32m===========> Running $@ ... \033[0m"

# BLOG_DIR
BLOG_DIR = /blog

LINKINATOR_IGNORE := "langchain.com golang.org goproxy.cn wikipedia.org docs.spring.io aliyun.com gov.cn favicon.ico github.com githubusercontent.com example.com github.io gnu.org _print"

##@ Common

.PHONY: install
install: ## Install the dependencies.
install:
	@$(LOG_TARGET)
	@if [ -d "node_modules" ]; then \
		echo "node_modules exists, removing..."; \
		rm -rf node_modules; \
	fi
	@echo "Installing dependencies..."
	pnpm install

.PHONY: nb
nb: ## Create a new blog post. use `make nb blog=test/test.md`
nb:
	@echo "Creating new blog post..."
	@FILE_PATH=blog/$(blog); \
	SLUG=$$(basename "$$FILE_PATH" | cut -d. -f1); \
	CURRENT_DATE=$$(date +"%Y-%m-%d %H:%M:%S"); \
	DIR=$$(dirname "$$FILE_PATH"); \
	TITLE=$$(echo "$$SLUG" | sed 's/-/ /g'); \
	if [ -f "$$FILE_PATH" ]; then \
		echo -e "\033[31mError: File $$FILE_PATH already exists. Please choose a different name.\033[0m"; \
		exit 1; \
	fi; \
	if [ ! -d "$$DIR" ]; then \
		mkdir -p "$$DIR"; \
		echo "Directory created: $$DIR"; \
	fi; \
	echo "---" > "$$FILE_PATH"; \
	echo "slug: $$SLUG" >> "$$FILE_PATH"; \
	echo "title: $$TITLE" >> "$$FILE_PATH"; \
	echo "date: $$CURRENT_DATE" >> "$$FILE_PATH"; \
	echo "authors: yuluo" >> "$$FILE_PATH"; \
	echo "tags: []" >> "$$FILE_PATH"; \
	echo "keywords: []" >> "$$FILE_PATH"; \
	echo "image: /img/***.png" >> "$$FILE_PATH"; \
	echo "---" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "<!-- truncate -->" >> "$$FILE_PATH"; \
	echo "" >> "$$FILE_PATH"; \
	echo "## " >> "$$FILE_PATH"; \
	echo "Blog post created at $$FILE_PATH"

## Tools
.PHONY: install-tools
install-tools:
	@$(LOG_TARGET)
	@echo "Installing tools..."
	npm install -g markdownlint-cli linkinator
	pip install --user yamllint codespell

##@ Docs
.PHONY: preview
preview: ## Start the Docusaurus server in preview mode.
preview:
	@$(LOG_TARGET)
	
	@if [ -d "node_modules" ]; then \
		echo "Starting Docusaurus server..."; \
		pnpm start; \
	else \
		echo "node_modules directory does not exist. Please run 'make install' to install dependencies."; \
	fi

.PHONY: build
build: ## Build the Docusaurus site.
build:
	@$(LOG_TARGET)
	@if [ -d "public" ]; then \
		echo "public exists, removing..."; \
		rm -rf public; \
	fi
	@echo "Docusaurus start build..."
	pnpm build

.PHONY: serve
serve: ## Start Docusaurus site with server mode.
serve: build
serve:
	@$(LOG_TARGET)
	pnpm serve

##@ Linter

.PHONY: markdown
markdown: ## Lint Check the markdown files.
markdown:
	@$(LOG_TARGET)
	markdownlint -c tools/linter/markdownlint/markdownlint.yaml "blog/*"

.PHONY: markdown-fix
markdown-fix: ## Lint Check the markdown files and fix them.
markdown-fix:
	@$(LOG_TARGET)
	markdownlint -c tools/linter/markdownlint/markdownlint.yaml --fix blog/*

.PHONY: yamllint
yamllint: ## Lint Check the yaml files.
yamllint:
	@$(LOG_TARGET)
	yamllint --config-file=tools/linter/yamllint/.yamllint .

.PHONY: codespell
codespell: ## Lint Check the codespell.
codespell: CODESPELL_SKIP := $(shell cat tools/linter/codespell/.codespell.skip | tr \\n ',')
codespell:
	@$(LOG_TARGET)
	codespell --skip $(CODESPELL_SKIP) --ignore-words tools/linter/codespell/.codespell.ignorewords --check-filenames

.PHONY: checklinks
checklinks: ## Check for broken links in the docs
	@$(LOG_TARGET)
	linkinator build -r --concurrency 25 --skip $(LINKINATOR_IGNORE)

.PHONY: pnpm-lint
pnpm-lint: ## Lint Check the pnpm files.
pnpm-lint:
	@$(LOG_TARGET)
	pnpm lint

.PHONY: pnpm-lint-fix
pnpm-lint-fix: ## Lint Check the pnpm files and fix them.
pnpm-lint-fix:
	@$(LOG_TARGET)
	pnpm lint --fix

## help: Show this help info.
.PHONY: help
help:
	@echo -e "Usage:\n  make \033[36m<Target>\033[0m \n\nTargets:"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo -e "$$USAGE_OPTIONS"
