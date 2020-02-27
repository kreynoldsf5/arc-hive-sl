import React from 'react'
import Loader from 'react-loader-spinner'

export default class ArcLoader extends React.Component {

    render(){
        return (
            <Loader 
                type="ThreeDots" color="#A9A9A9" height={100} width={100}
                style={{ textAlign: "center" }}
            />
        )
    }

};
