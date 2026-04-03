## ADDED Requirements

### Requirement: uploadSkill pins content and returns CID
`uploadSkill(content)` SHALL upload the SKILL.md string to IPFS via Pinata using `PINATA_JWT` for authentication and return the resulting CID string.

#### Scenario: Successful upload
- **WHEN** `uploadSkill(content)` is called with a non-empty string
- **THEN** the content is pinned on IPFS and the function returns a non-empty CID string

#### Scenario: Pinata auth failure
- **WHEN** `PINATA_JWT` is invalid or expired
- **THEN** the function throws an error with a descriptive message

### Requirement: fetchSkill retrieves content by CID from public gateway
`fetchSkill(cid)` SHALL fetch the content at `https://gateway.pinata.cloud/ipfs/<cid>` and return it as a string.

#### Scenario: Successful fetch
- **WHEN** `fetchSkill(cid)` is called with a valid CID
- **THEN** the function returns the SKILL.md content string

#### Scenario: CID not found
- **WHEN** the gateway returns 404 for the given CID
- **THEN** the function returns `null`

#### Scenario: Gateway error
- **WHEN** the gateway returns a non-404 error status
- **THEN** the function throws an error with the status code
