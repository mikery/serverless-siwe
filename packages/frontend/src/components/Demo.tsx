import {Connector, useAccount, useConnect, useDisconnect} from "wagmi";
import {Alert, AlertProps, Button, Space} from "antd";
import {useCallback, useState} from "react";
import {SiweMessage} from "siwe";

export const Example = () => {
    const {connect, connectors, isConnecting, pendingConnector} = useConnect()
    const {data: accountData} = useAccount()
    const {disconnect} = useDisconnect()
    const [alertMessage, setAlertMessage] = useState<{ type: AlertProps["type"], message: string } | undefined>(undefined)
    const performSiwe = useCallback(async (connector: Connector) => {
        setAlertMessage({type: "info", message: "Signing message"})

        const account = await connector.getAccount()
        const nonceRes = await fetch(`${process.env.REACT_APP_API_URL}/api/nonce`)
        const message = new SiweMessage({
            domain: window.location.host,
            address: account,
            statement: 'Sign in with Ethereum to the app.',
            uri: window.location.origin,
            version: '1',
            chainId: await connector.getChainId(),
            nonce: await nonceRes.text(),
        })

        const signer = await connector.getSigner()
        const signature = await signer.signMessage(message.prepareMessage())
        const verifyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/verify`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message, signature}),
        })
        if (!verifyRes.ok) {
            return setAlertMessage({type: "error", message: "Error verifying message"})
        }
        const data = await verifyRes.json()
        if (data.ok) {
            setAlertMessage({type: "success", message: `Signature verified. Address: ${account.substring(0, 8)}`})
        } else {
            console.log(data)
            setAlertMessage({type: "error", message: `Error verifying message: ${data.message}`})
        }
    }, [])

    return (
        <div>
            {alertMessage && <Alert type={alertMessage.type} message={alertMessage.message}/>}
            <h3>{accountData ? "Sign with wallet" : "Connect wallet"}</h3>

            <Space direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
                {connectors.map((connector) => (

                    <Button
                        disabled={!connector.ready}
                        key={connector.id}
                        onClick={async () => {
                            connect(connector)
                            try {
                                await performSiwe(connector)
                            } catch (e) {
                                // @ts-ignore
                                return setAlertMessage({type: "error", message: e.message})
                            }
                        }}
                    >
                        {connector.name}
                        {!connector.ready && ' (unsupported)'}
                        {isConnecting &&
                            connector.id === pendingConnector?.id &&
                            ' (connecting)'}
                    </Button>
                ))}
            </Space>

            <Space direction="horizontal" style={{width: '100%', justifyContent: 'center', marginTop: "10px"}}>
                <Button
                    disabled={!accountData}
                    onClick={() => {
                        disconnect()
                        setAlertMessage({type: "info", message: "Wallet disconnected"})
                    }}>Disconnect</Button>
            </Space>
        </div>
    )
}