// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PhatRollupAnchor.sol";
import "hardhat/console.sol";
contract TestLensApiConsumerContract is PhatRollupAnchor, Ownable {
    event ResponseReceived(uint reqId, string pair, uint256 value,uint s1,uint s2,uint s3,string natue);
    event ErrorReceived(uint reqId, string pair, uint256 errno,uint s1,uint s2,uint s3,string natue);

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;

    mapping(uint => string) requests;
    uint nextRequest = 1;

    constructor(address phatAttestor) {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(string calldata profileId) public {
        // assemble the request
        uint id = nextRequest;
        requests[id] = profileId;
        _pushMessage(abi.encode(id, profileId));
        nextRequest += 1;
    }

    // For test
    function malformedRequest(bytes calldata malformedData) public {
        uint id = nextRequest;
        requests[id] = "malformed_req";
        _pushMessage(malformedData);
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
      
        (uint respType, uint id, uint256 data,uint s1,uint s2,uint s3,string memory nature) = abi.decode(
            action,
            (uint, uint, uint256,uint,uint,uint,string)
        );
        console.logUint(s1);
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requests[id], data,s1,s2,s3,nature);
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requests[id], data,s1,s2,s3,nature);
            delete requests[id];
        }
    }
}
