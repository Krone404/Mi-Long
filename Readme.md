# 米龙 (Mǐ lóng)
To Run the Repo:
1. Go to VS Code and click Source Control (third icon down on the side)

2. Click Clone Repository and select the repository.

3. Create a virtual environment by:
    3a. Opening the terminal (CTRL + Shift + ')
    3b. If the virtual environment is not set up, Paste the following:
        ```
            python3 -m venv .venv
        ```
    3c. Then activate the virtual environment after installing.
        ```
            .venv/scripts/activate
        ```
            You may need to go into powershell and run 
        ```
            Set-ExecutionPolicy unrestricted
        ```
    3d. Then install the packages
        ```
            pip install -r requirements.txt
        ```