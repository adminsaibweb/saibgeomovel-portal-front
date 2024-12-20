import React, { Component } from 'react';
import { LinhaRodape, DivRodape } from './styled';
import { Icon } from 'react-materialize/';

export default class FooterAndButtonsNextAndBack extends Component {
  render() {
    const { action } = this.props;
    return (
      <LinhaRodape>
        <DivRodape>
          <button
            type="submit"
            disabled={this.props.disabledBtnBack}
            className="waves-effect waves-light saib-button is-primary"
            onClick={() => {
              this.props.clickButtonBack();
            }}
          >
            <Icon>arrow_back</Icon>
            Anterior
          </button>
          {action !== 'view' && (
            <button
              type="submit"
              disabled={this.props.disabled}
              className="waves-effect waves-light saib-button is-primary "
              onClick={() => {
                this.props.clickButtonNext();
              }}
            >
              {this.props.titleButton}
              <Icon>{this.props.icon}</Icon>
            </button>
          )}
        </DivRodape>
      </LinhaRodape>
    );
  }
}
