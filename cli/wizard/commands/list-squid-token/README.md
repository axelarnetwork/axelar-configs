# List Squid Token

List a new interchain token on [`Squid`](<[https://](https://app.squidrouter.com/)>)

## Command Flow

1. The command starts by prompting the user for information.
   - It asks if the token has been registered via the ITS portal.
   - It requests the URL of the token details, including the token address and environment.
2. It constructs API URLs to search for the token and fetch its details.
3. It performs API requests to search for the token and fetch its details. If the API requests fail, it proceeds with empty data.
4. It parses the fetched token details into an interchain token configuration.

5. The command asks the user if they want to save the configuration to a local file.

6. If the user chooses to save the configuration, it updates the local token list configuration with the new token.

7. It checks if the token already exists in the token list. If it does, the command exits with an error.

8. If the user chooses to create a PR, it performs the following actions:
   - Creates a new Git branch.
   - Adds the updated token list configuration to the branch.
   - Commits the changes.
   - Pushes the branch to the remote repository.
