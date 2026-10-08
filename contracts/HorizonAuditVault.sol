// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HorizonAuditVault is Ownable {
    
    struct AuditLog {
        string incidentId;
        string actionType;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => AuditLog) public auditLogs;

    event AuditHashRecorded(bytes32 indexed logHash, string incidentId, string actionType, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function recordAuditHash(bytes32 logHash, string memory incidentId, string memory actionType) external onlyOwner {
        require(!auditLogs[logHash].exists, "Audit hash already recorded");

        auditLogs[logHash] = AuditLog({
            incidentId: incidentId,
            actionType: actionType,
            timestamp: block.timestamp,
            exists: true
        });

        emit AuditHashRecorded(logHash, incidentId, actionType, block.timestamp);
    }

    function verifyAuditHash(bytes32 logHash) external view returns (bool, string memory, string memory, uint256) {
        AuditLog memory log = auditLogs[logHash];
        if (!log.exists) {
            return (false, "", "", 0);
        }
        return (true, log.incidentId, log.actionType, log.timestamp);
    }
}
