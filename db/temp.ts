import { hashSync } from "bcrypt-ts";


async function main() {
    console.log(hashSync("hellohello",10))
}

main();