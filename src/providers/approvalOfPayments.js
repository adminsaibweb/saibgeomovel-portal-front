import React, { createContext, Component } from "react"

export const ApprovalOfPaymentsContext = createContext({
  updateDocument: false,
  setUpdateDocument: () => {}
})

export default class ApprovalOfPaymentsProvider extends Component {
  state = {
    updateDocument: false
  }

  setUpdateDocument = () => {
    const { updateDocument } = this.state;
    this.setState({
      updateDocument: updateDocument ? false : true,
    })
  }

  render() {
    const { updateDocument } = this.state
    return (
      <ApprovalOfPaymentsContext.Provider value={{
        updateDocument,
        setUpdateDocument: this.setUpdateDocument
      }}>
        {this.props.children}
      </ApprovalOfPaymentsContext.Provider>
    )
  }
}