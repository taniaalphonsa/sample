# Define variables
DIR = waf
SCRIPT = server.js
NODE = node

# Default target
all: run

# Target to run the server
run:
	cd $(DIR) && $(NODE) $(SCRIPT)

# Clean target (optional, if you want to add clean-up commands later)
clean:
	@echo "Nothing to clean."

# Phony targets
.PHONY: all run clean
