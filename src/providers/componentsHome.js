import React, { createContext, Component } from "react"

export const ComponentsHomeContext = createContext()

export default class ComponentsHomeProvider extends Component {
  state = {
    active: false
  }

  setActiveActivity = (value) => {
    this.setState((prevState) => ({
      ...prevState,
      active: value,
    }));
  };

  render() {
    const { active } = this.state
    return (
      <ComponentsHomeContext.Provider value={{
        active,
        setActiveActivity: this.setActiveActivity
      }}>
        {this.props.children}
      </ComponentsHomeContext.Provider>
    )
  }
}