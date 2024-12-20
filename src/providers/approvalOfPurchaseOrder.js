import React, { createContext, Component } from "react"

export const ApprovalOfPurchaseOrderContext = createContext()

export default class ApprovalOfPurchaseOrderProvider extends Component {
  state = {
    updateOrder: false
  }

  setUpdateOrder = () => {
    const { updateOrder } = this.state;
    this.setState({
      updateOrder: updateOrder ? false : true,
    })
  }

  render() {
    const { updateOrder } = this.state
    return (
      <ApprovalOfPurchaseOrderContext.Provider value={{
        updateOrder,
        setUpdateOrder: this.setUpdateOrder
      }}>
        {this.props.children}
      </ApprovalOfPurchaseOrderContext.Provider>
    )
  }
}