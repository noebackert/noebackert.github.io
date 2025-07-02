// Enhanced Code Block Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add language labels to code blocks
    function addLanguageLabels() {
        const codeBlocks = document.querySelectorAll('.highlight');
        
        codeBlocks.forEach(function(codeBlock, index) {
            // Skip if language label already exists
            if (codeBlock.querySelector('.code-lang-label')) {
                return;
            }
            
            // Look for code element in the complex Hugo/Chroma structure
            const code = codeBlock.querySelector('code[class*="language-"]') || 
                        codeBlock.querySelector('code[data-lang]') ||
                        codeBlock.querySelector('code');
            
            if (!code) {
                return;
            }
            
            let language = null;
            
            // Check data-lang attribute first (most reliable for Hugo/Chroma)
            if (code.hasAttribute('data-lang')) {
                language = code.getAttribute('data-lang');
            }
            
            // Check code element classes
            if (!language && code.className) {
                const codeClassMatch = code.className.match(/language-(\w+)/);
                if (codeClassMatch) {
                    language = codeClassMatch[1];
                }
            }
            
            if (language) {
                // Filter out generic/unknown language types
                const genericLanguages = ['text', 'plain', 'fallback', 'unknown', 'nohighlight', 'none'];
                if (genericLanguages.includes(language.toLowerCase())) {
                    return; // Don't show label for generic languages
                }
                
                const displayLang = getLanguageDisplayName(language.toLowerCase());
                
                // Create language label element
                const langLabel = document.createElement('div');
                langLabel.className = 'code-lang-label';
                langLabel.textContent = displayLang;
                
                // Add label to code block (as first child)
                codeBlock.insertBefore(langLabel, codeBlock.firstChild);
            }
        });
    }
    
    // Get proper display name for programming languages
    function getLanguageDisplayName(lang) {
        const languageMap = {
            'js': 'JavaScript',
            'javascript': 'JavaScript',
            'ts': 'TypeScript',
            'typescript': 'TypeScript',
            'py': 'Python',
            'python': 'Python',
            'c': 'C',
            'cpp': 'C++',
            'cxx': 'C++',
            'java': 'Java',
            'cs': 'C#',
            'csharp': 'C#',
            'php': 'PHP',
            'rb': 'Ruby',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'rs': 'Rust',
            'sh': 'Shell',
            'bash': 'Bash',
            'zsh': 'Zsh',
            'fish': 'Fish',
            'powershell': 'PowerShell',
            'ps1': 'PowerShell',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'sass': 'Sass',
            'less': 'Less',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML',
            'yml': 'YAML',
            'toml': 'TOML',
            'ini': 'INI',
            'sql': 'SQL',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'sqlite': 'SQLite',
            'markdown': 'Markdown',
            'md': 'Markdown',
            'tex': 'LaTeX',
            'latex': 'LaTeX',
            'dockerfile': 'Dockerfile',
            'makefile': 'Makefile',
            'gitignore': 'GitIgnore',
            'r': 'R',
            'matlab': 'MATLAB',
            'octave': 'Octave',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'scala': 'Scala',
            'clojure': 'Clojure',
            'erlang': 'Erlang',
            'elixir': 'Elixir',
            'haskell': 'Haskell',
            'lua': 'Lua',
            'perl': 'Perl',
            'vim': 'Vim',
            'apache': 'Apache',
            'nginx': 'Nginx',
            'conf': 'Config',
            'config': 'Config'
        };
        
        return languageMap[lang] || lang.toUpperCase();
    }
    
    // Initialize language labels with a slight delay to ensure content is loaded
    setTimeout(function() {
        addLanguageLabels();
    }, 100);
    
    // Also try immediately
    addLanguageLabels();
    
    // Re-add language labels when new content is loaded
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && (node.classList.contains('highlight') || node.querySelector('.highlight'))) {
                    addLanguageLabels();
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
