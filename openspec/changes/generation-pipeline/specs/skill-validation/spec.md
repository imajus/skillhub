## ADDED Requirements

### Requirement: Validate stage checks spec conformance and ABI accuracy
The validate stage SHALL check that the generated SKILL.md conforms to the Agent Skills spec structure and that all referenced function names exist in the fetched ABI.

#### Scenario: Valid SKILL.md
- **WHEN** the SKILL.md passes all checks
- **THEN** the validate stage returns `{ valid: true }`

#### Scenario: Spec conformance failure
- **WHEN** the SKILL.md is missing required sections
- **THEN** the validate stage returns `{ valid: false, reason: <description> }`

#### Scenario: ABI cross-check failure
- **WHEN** the SKILL.md references a function not present in the ABI
- **THEN** the validate stage returns `{ valid: false, reason: <description> }`

### Requirement: Pipeline retries Generate on validation failure
The pipeline SHALL retry the Generate stage up to 2 times when Validate returns `{ valid: false }`, passing the failure reason back to the LLM as context.

#### Scenario: Validation fails then succeeds on retry
- **WHEN** the first Generate attempt fails validation and the second passes
- **THEN** the pipeline proceeds with the second output

#### Scenario: All retries exhausted
- **WHEN** validation fails on the initial attempt and both retries
- **THEN** the pipeline returns a failure result with the last validation reason

### Requirement: Successful pipeline uploads to IPFS and returns CID
On successful validation, the pipeline SHALL upload the SKILL.md content to IPFS via Pinata and return the resulting CID as the skill ID.

#### Scenario: Upload succeeds
- **WHEN** validation passes and Pinata upload succeeds
- **THEN** the pipeline returns `{ success: true, cid: <CID> }`

#### Scenario: Upload fails
- **WHEN** the Pinata upload throws an error
- **THEN** the pipeline returns a failure result with the upload error
