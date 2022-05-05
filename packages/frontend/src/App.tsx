import React from 'react';
import "antd/dist/antd.compact.css";
import {Example} from "./components/Demo";
import {chain, createClient, defaultChains, Provider} from "wagmi";
import {MetaMaskConnector} from 'wagmi/connectors/metaMask'
import {Card, Col, Row, Space} from "antd";

const chains = defaultChains
const defaultChain = chain.mainnet

const client = createClient({
    autoConnect: true,
    connectors({chainId}) {
        const chain = chains.find((x) => x.id === chainId) ?? defaultChain

        return [
            new MetaMaskConnector({chains}),
            // new WalletConnectConnector({
            //   chains,
            //   options: {
            //     qrcode: true,
            //     rpc: { [chain.id]: "http://example.com" },
            //   },
            // }),
            // new InjectedConnector({
            //   chains,
            //   options: { name: 'Injected' },
            // }),
        ]
    },
})

function App() {
    return (
        <Provider client={client}>
            <div className="App" style={{backgroundColor: "#ececec"}}>
                <Row
                    style={{display: "flex", alignItems: "center", height: "100vh"}}
                    justify="center"
                    gutter={10}
                >
                    <Col>
                        <Card title={<h2>Sign in with Ethereum 🤝 Serverless Framework</h2>}>
                            <Example/>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Provider>
    );
}

export default App;
