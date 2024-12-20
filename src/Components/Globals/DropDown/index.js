import React, { Component } from 'react';
import { Icon } from 'react-materialize';
import { NavBar, Container, ContentChild } from './styled';

class Dropdown extends Component {
  state = {
    checkedInput: false,
  };

  closedDropdown = (event) => {
    this.setState({ checkedInput: false });
  };

  opendDropdown = (event) => {
    setTimeout(() => {
      this.setState({ checkedInput: true });
    }, 100);
  };

  render() {
    const { checkedInput } = this.state;
    const { buttonComponent, onClick, body } = this.props;
    return (
      <NavBar className="contentNavBar" display={checkedInput === true ? 'block' : 'none'}>
        <div
          onClick={(ev) => {
            onClick();
            this.opendDropdown(ev);
          }}
        >
          {buttonComponent}
        </div>
        <Container
          style={{
            display: checkedInput === true ? 'block' : 'none',
            width: '100%',
            height: '100vh',
            top: 0,
            left: 0,
            background: 'transparent',
            position: 'absolute',
            zIndex: '20',
          }}
        >
          <ContentChild>
            <button
              className="saib-button is-primary closeDropDown"
              onClick={(ev) => {
                onClick();
                this.closedDropdown(ev);
              }}
            >
              <Icon tiny>close</Icon>
            </button>
            {body}
          </ContentChild>
        </Container>
      </NavBar>
    );
  }
}

export default Dropdown;
