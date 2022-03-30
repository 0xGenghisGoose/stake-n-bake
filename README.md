# Stake N Bake

A simple staking protocol that allows users to mint Stakin Tokens (STK) & stake them, rewarding users in Bakin Tokens (BKT).

This was a quick project (my first!) that I put together to improve upon my Solidity skills. I wrote all three smart contracts, tested each of them, then hooked them up to a quick & dirty frontend (it ain't great) so that I could play around with them.

## Get Started

To begin using Stake N Bake in its entirety, please clone down this repository, install the dependencies and use `npm run dev` to fire up the frontend (or just visit the Vercel deployment!). You will also need to create a .env file (example file included) & input your own Rinkeby Private Key & Alchemy API key.

To begin using Stake N Bake the protocol, you first need to be on the Rinkeby testnet & own some testnet Ether (there are a handful of faucets to get these from, if you're still having trouble locating a bit please message me & I will send you some).

Once you're all set & have everything spun up & connected property, simply input the amount of Stakin Tokens on the UI that you would like to mint (price: .001 Ether per STK) & you will own some Stakin Tokens!

## Stake

To stake, input the amount of Stakin Tokens that you would like to lock into the protocol & hit the stake button. The UI will update automatically (might need a second or a quick refresh...) & will send you a window alert upon success.

## Unstake

To unstake, follow the same steps as Staking except for in the Unstake section - input the amount of STK you would like to unstake & hit the corresponding button under the input field. This will again trigger the loading screen & give you a window alert upon completion.

## Bake

This is the magic button that calculates the rewards a user has (based on total amount of STK staked, amount of STK the user has staked, and amount of time spent staked) & automatically mints the rewards in BKT directly to the user. This can be called as many times as a user fancies, since it just recalculates each time based on the user calling the function (pressing the Bake button).

## Testing

I did not spend an inordinate amount of time on testing, as I was just trying to get something up & working well as fast as possible without sacrificing good contract code.

All of the tests that I did write & use can be found in the `test` folder or by running `npx hardhat test`

## What I Learned

I absolutely loved building this dapp & had a fantastic time doing it! I learned a ton about some of the smaller intricacies of the language & process that most people don't tell you about, such as seamless passing of numbers & big numbers between the frontend & contracts (without the dreaded cannot estimate gas error!) & working with the token allowance / user flow, to name a few.

I have zero plans on slowing down & hope to spin up some dapps like these weekly to learn in public with everyone. Looking forward, I will continue to do dapps like these day in & day out until an employer notices my work ethic & hopefully gives your boy a shot :-)

But until then, I also plan on posting a write up about my experiences making this dapp at some point soon to my blog with more in-depth analysis on the process, and what I could've done / could do to improve it moving forward. A link to my website is on my Github profile, please check it out!

## Disclaimer

These contracts were made for fun & education, and should not be used in production. They are not gas optimized, they do not prevent reentrancy attacks, and they do not make complete checks on owners & allowances (which is something allll production contracts should obviously do!).

I have completely annotated the logic (Stakeable) contract, however I have not annotated the two token contracts, as they are pretty simple ERC20 implementations.

And as always, if anyone has any comments or tips or literally anything to say about this, pleaseeee hit me up on Twitter, Discord, Github, email, whatever - I love chatting with everyone & making new friends as I go.

Cheers!
