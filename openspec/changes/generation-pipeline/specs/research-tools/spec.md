## ADDED Requirements

### Requirement: fetchABI retrieves parsed ABI from Uniblock
`fetchABI(contractAddress, chainId)` SHALL call `GET /scan/contract-abi?chainId=<chainId>&address=<contractAddress>` on the Uniblock API with `X-API-KEY` header and return the parsed ABI JSON.

#### Scenario: Successful ABI fetch
- **WHEN** a valid contract address and chainId are provided
- **THEN** the function returns the parsed ABI array from Uniblock

#### Scenario: Uniblock returns an error
- **WHEN** Uniblock responds with a non-2xx status
- **THEN** the function throws an error with the status code and response body

### Requirement: fetchSourceCode retrieves verified source code
`fetchSourceCode(contractAddress)` SHALL call the Uniblock source code endpoint and return the verified source as a string, truncated to a defined token budget if necessary.

#### Scenario: Verified source available
- **WHEN** the contract has verified source code on Uniblock
- **THEN** the function returns the source string (truncated if over budget)

#### Scenario: Source not verified
- **WHEN** Uniblock has no verified source for the address
- **THEN** the function returns `null`

### Requirement: detectERCPatterns identifies ERC standards
`detectERCPatterns(abi)` SHALL inspect ABI function and event signatures and return an array of detected standard names (e.g., `["ERC-20"]`, `["ERC-721"]`, `["ERC-1155"]`).

#### Scenario: ERC-20 detected
- **WHEN** the ABI contains `transfer`, `approve`, `transferFrom`, `balanceOf`, `allowance`
- **THEN** the result includes `"ERC-20"`

#### Scenario: No known standard
- **WHEN** the ABI matches no known ERC signature set
- **THEN** the result is an empty array
