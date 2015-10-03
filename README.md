# Jupyter devinstall tool
Utility designed to simplify the installation of a Jupyter/IPython development environment.

![Demo screen cast](/demo.gif)

## Installation
Make sure you have iojs (and npm, which is included) installed on your machine, then run:

```
npm install -g jupyter-devinstall
```

(you may need to prefix the line with `sudo `)

## Usage

```
jupyter-devinstall <Git Hub Username> <Installation directory>
```

Example for GitHub username `jdfreder` installed to the HOME directory:

```
jupyter-devinstall jdfreder ~/
```

## Notes

Part way through the tool will behave like a wizard, prompting you for input.  
  
The tool will ask you if you want to install locally, globally, or not at all:  
locally - pip install each repository  
globally - pip install each repository with the `-g` flag.  This may require sudo, which may have undesired side effects.  
not at all - doesn't pip install anything  

