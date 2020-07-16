type storage = {
  contractAddress: address,
  owner: address,
  price: tez
} ;

type action =
  | Buy (nat)
  | UpdateContract (address)
  | UpdatePrice (tez)
  | Withdraw;

let buy = ((amt, s): (nat, storage)): (list (operation), storage) => {
  if(Tezos.amount != s.price * amt) {
    failwith("WRONGAMOUNT"): (list (operation), storage);
  } else {
    switch (Tezos.get_contract_opt(s.contractAddress): option (contract ((address, nat)))){
      | None => failwith ("WRONGCONTRACT"): (list (operation), storage)
      | Some (contr) => 
        ([Tezos.transaction((Tezos.source, amt), 0tez, contr)], s);
    }
  }
} ;

let updateContract = ((contractAddress, s): (address, storage)): storage => {
  // Updates contract address
  // Only by current contract owner
  if(Tezos.source == s.owner) {
    {...s, contractAddress: contractAddress}
  } else {
    failwith("FORBIDDENACTION"): storage ;
  }
} ;

let updatePrice = ((newPrice, s): (tez, storage)): storage => {
  // Updates price per token
  // Only by current contract owner
  if(Tezos.source == s.owner) {
    {...s, price: newPrice}
  } else {
    failwith("FORBIDDENACTION"): storage ;
  }
}

let withdraw = (s: storage): (list (operation), storage) => {
  // Withdraw balance
  // Only by current contract owner
  if(Tezos.source == s.owner) {
    let contrAddress: contract (unit) = switch (Tezos.get_contract_opt(s.owner): option (contract (unit))){
      | None => failwith ("WRONGCONTRACT"): contract (unit)
      | Some (contr) => contr ;
    } ;

    ([Tezos.transaction(unit, Tezos.balance, contrAddress)], s) ;
  } else {
    failwith("FORBIDDENACTION"): (list (operation), storage) ;
  }
}

let main = ((p, storage): (action, storage)) => {
  switch (p) {
    | Buy (n) => buy((n, storage))
    | UpdateContract (n) => ([]: list(operation), updateContract((n, storage)))
    | UpdatePrice (n) => ([]: list(operation), updatePrice((n, storage)))
    | Withdraw => withdraw(storage)
    };
};