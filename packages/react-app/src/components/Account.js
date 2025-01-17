import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from "ethers";
// import BurnerProvider from 'burner-provider';
import Web3Modal from "web3modal";
import { Address } from "."
import { usePoller } from "../hooks"
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Button } from 'antd';

const INFURA_ID = process.env.REACT_APP_INFURA_ID;

const web3Modal = new Web3Modal({
  //network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID
      }
    }
  }
});

export default function Account(props) {

  const loadWeb3Modal = async () => {
    const provider = await web3Modal.connect();
    await props.setInjectedProvider(new ethers.providers.Web3Provider(provider))
  };

  const logoutOfWeb3Modal = async ()=>{
    const clear = await web3Modal.clearCachedProvider();
    setTimeout(()=>{
      window.location.reload()
    },1)
  }

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, []); // runs once if cached provider exist

  useEffect(() => {
    pollInjectedProvider();
  }, [props.injectedProvider]);

  const pollInjectedProvider = async () => {
    console.log('polling accounts');
    if(props.injectedProvider){
      let accounts = await props.injectedProvider.listAccounts()
      if(accounts && accounts[0] && accounts[0] != props.account){
        //console.log("ADDRESS: ",accounts[0])
        if(typeof props.setAddress == "function") props.setAddress(accounts[0])
      }
    }
  }

  // turn on address poller for injected provider
  usePoller(()=>{pollInjectedProvider()},props.pollTime?props.pollTime:1999)
  
  let modalButtons = []
  if (web3Modal.cachedProvider) {
    modalButtons.push(
      <Button key="logoutbutton" type={"primary"} onClick={logoutOfWeb3Modal}>LOG OUT</Button>
    )
  }else{
    modalButtons.push(
      <Button key="loginbutton" type={"primary"} onClick={loadWeb3Modal}>CONNECT WALLET</Button>
    )
  }    
  
  let displayAddress;
  if(props.address) {
    displayAddress = <Address value={props.address} ensProvider={props.mainnetProvider}/>;
  }

  return (
    <div className="account">
      <span className="accountLink"><Link style={{verticalAlign:'middle'}} to="/">THIS ARTWORK IS ALWAYS ON SALE</Link></span>
      {displayAddress}
      {modalButtons}
    </div>
  );
  
}
