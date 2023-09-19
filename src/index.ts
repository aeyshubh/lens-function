import "@phala/pink-env";
import { Coders } from "@phala/ethers";
import { StringCoder } from "@phala/ethers/lib.commonjs/abi/coders";
import { METHODS } from "http";
type HexString = `0x${string}`

// eth abi coder
const uintCoder = new Coders.NumberCoder(32, false, "uint256");
const stringCoder = new Coders.StringCoder("string")
const bytesCoder = new Coders.BytesCoder("bytes");

function encodeReply(reply: [number, number, number,number, number, number,string]): HexString {
  return Coders.encode([uintCoder, uintCoder, uintCoder,uintCoder, uintCoder, uintCoder,stringCoder], reply) as HexString;
}

// Defined in TestLensOracle.sol
const TYPE_RESPONSE = 0;
const TYPE_ERROR = 2;

enum Error {
  BadLensProfileId = "BadLensProfileId",
  FailedToFetchData = "FailedToFetchData",
  FailedToDecode = "FailedToDecode",
  MalformedRequest = "MalformedRequest",
  dataError ="DataError",
}

function errorToCode(error: Error): number {
  switch (error) {
    case Error.BadLensProfileId:
      return 1;
    case Error.FailedToFetchData:
      return 2;
    case Error.FailedToDecode:
      return 3;
    case Error.MalformedRequest:
      return 4;
    case Error.dataError:
      return 5
    default:
      return 0;
  }
}

function isHexString(str: string): boolean {
  const regex = /^0x[0-9a-f]+$/;
  return regex.test(str.toLowerCase());
}

function stringToHex(str: string): string {
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return "0x" + hex;
}

function fetchLensApiStats(lensApi: string, profileId: string): any {
  // profile_id should be like 0x0001
  
  let headers = {
    "Content-Type": "application/json",
    "User-Agent": "phat-contract",
  };
  let query = JSON.stringify({
    query: `query Profile {
            profile(request: { profileId: \"${profileId}\" }) {
                stats {
                    totalFollowers
                    totalFollowing
                    totalPosts
                    totalComments
                    totalMirrors
                    totalPublications
                    totalCollects
                }
            }
        }`,
  });
  let body = stringToHex(query);
  //
  // In Phat Function runtime, we not support async/await, you need use `pink.batchHttpRequest` to
  // send http request. The function will return an array of response.
  //
  let [response1,response2] = pink.batchHttpRequest(
    [
      {
        url: lensApi,
        method: "POST",
        headers,
        body,
        returnTextBody: true,
      },
      {
        url:`https://node-api-production-bfa7.up.railway.app/api/products?lens_id=${profileId}`,
        method:"GET",
        headers,
        returnTextBody:true
      }
    ],
    10000
  );
 
  if (response1.statusCode !== 200) {
    console.log(
      `Fail to read Lens api with status code: ${response1.statusCode}, error: ${
        response1.error || response1.body
      }}`
    );
    throw Error.FailedToFetchData;
  }
  let respBody = response1.body;
  let resBody2 = response2.body;
  let aa = [];
aa.push(respBody,resBody2);
  //console.log("The response body is",respBody,"response body 2 is",resBody2);
  //let atack1 = resBody2["data"].attack1
  if (typeof respBody !== "string" && typeof respBody !== "string" ) {
    throw Error.FailedToDecode;
  }
  return aa;
}

function parseProfileId(hexx: string): string {
  var hex = hexx.toString();
  if (!isHexString(hex)) {
    throw Error.BadLensProfileId;
  }
  hex = hex.slice(2);
  var str = "";
  for (var i = 0; i < hex.length; i += 2) {
    const ch = String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    str += ch;
  }
  return str;
}

export default function main(request: HexString, settings: string): HexString {
  console.log(`handle req: ${request}`);
  let requestId, encodedProfileId;
  try {
    [requestId, encodedProfileId] = Coders.decode([uintCoder, bytesCoder], request);
  } catch (error) {
    console.info("Malformed request received");
    return encodeReply([TYPE_ERROR, 0, errorToCode(error as Error),0,0,0,"Awesome"]);
  }
  const profileId = parseProfileId(encodedProfileId as string);
  console.log(`Request received for profile ${profileId}`);

  try {
    const respData = fetchLensApiStats(settings, profileId);
    const resp1 = JSON.parse(respData[0])
    const resp2 = JSON.parse(respData[1]);
    console.log("The response in the main is::",resp2);
    let stats = resp1.data.profile.stats.totalCollects+resp1.data.profile.stats.totalFollowers*100+resp1.data.profile.stats.totalFollowing*300+resp1.data.profile.stats.totalPosts*400;
    let stats2:number = resp2.data[0].attack1;
    let stats3:number = resp2.data[0].attack2;
    let stats4:number = resp2.data[0].attack3;
    let nature:string = resp2.data[0].nature;

    console.log("response:", [TYPE_RESPONSE, requestId, stats,stats2,stats3,stats4,nature]);
    return encodeReply([TYPE_RESPONSE, requestId, stats,stats2,stats3,stats4,nature]);
  } catch (error) {
    if (error === Error.FailedToFetchData) {
      throw error;
    } else {
      // otherwise tell client we cannot process it
      console.log("error:", [TYPE_ERROR, requestId, error]);
      return encodeReply([TYPE_ERROR, requestId, errorToCode(error as Error),0,0,0,"Awesome"]);
    }
  }
}
