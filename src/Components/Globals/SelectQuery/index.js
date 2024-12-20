import React, { Component } from 'react';
import { Icon } from 'react-materialize';
import { Container, EachItem, DivDetalhe, ContentInput, ContentLoading } from './styled';
import Autocomplete from 'react-autocomplete';
import { capitalize } from '../../../services/funcoes';

export default class SelectQuery extends Component {
  state = {
    valueSelect: '',
    itemSelected: '',
    openOptions: false,
    options: [],
    allOptions: [],
    noOptions: false,
    focused: false,
    widthContent: 0,
  };
  timeOut = () => { };
  refContentInput = React.createRef(null);

  componentDidMount() {
    this.handleOptions();
    this.handleDetailsInput();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.query !== this.props.query) {
      this.handleOptions();
    }

    if (prevProps.itemSelected !== this.props.itemSelected && !this.props.itemSelected) {
      await this.deleteOptionsSelected(true);
      this.filterOptions('');
    }

    if (prevProps.itemSelected !== this.props.itemSelected && this.props.itemSelected) {
      this.handleOptions();
      this.handleDetailsInput();
    }
  }

  handleDetailsInput = () => {
    const nameInput = this.props.inputName ? this.props.inputName : 'contentInput';
    const content = document.getElementById(nameInput);
    const inputEl = content.getElementsByTagName('div')[0].getElementsByTagName('input');

    this.setState({
      inputEl,
    });

    inputEl[0].onblur = () => {
      setTimeout(() => {
        this.setState({
          focused: false,
        });
      }, 200);
    };

    inputEl[0].onclick = () => {
      this.setState({
        focused: true,
      });
    };
  };

  handleOptions = async () => {
    const { query, keys, label, onChangeComponentIsExternal, itemSelected } = this.props;
    const { valueSelect } = this.state;
    const newOptions = [];

    if (query && onChangeComponentIsExternal ? valueSelect.length >= 3 : true)
      if (query?.length > 0)
        for (let item of query) {
          let obj = { keys: [] };
          if (item && item[label]) {
            obj.label = item[label];

            for (let key of keys) {
              if (item[key] !== null || item[key] !== undefined) obj.keys.push({ [key]: item[key] });
            }
            newOptions.push(obj);
          }
        }


    this.setState(
      {
        options: newOptions,
        allOptions: newOptions,
      },
      () => {
        if (itemSelected) {
          const item = this.filterOptions(itemSelected);

          if (item.length > 0) {
            this.onClickItemOption(item[0], false);
          }
        }
      }
    );
  };

  isRelationBetweenTwoStrings = (valueA, valueB) => {
    const value_a = String(valueA)
      .toUpperCase()
      .trim()
      .replace(/\s/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const value_b = String(valueB)
      .toUpperCase()
      .trim()
      .replace(/\s/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return String(value_a).includes(value_b);
  };

  handlePrepareObjectToSend = (value) => {
    const objectToSend = {
      label: value.label,
    };
    value.keys.forEach((item) => {
      Object.keys(item).forEach((key) => {
        objectToSend[key] = item[key];
      });
    });

    return objectToSend;
  };

  onChangeExternal = async (value) => {
    const { onChangeComponentIsExternal, onChange } = this.props;
    if (onChangeComponentIsExternal) {
      await onChange(value);
    }
  };

  onChange = async (ev) => {
    let { value } = ev.target;
    const { onChangeComponentIsExternal } = this.props;

    if (onChangeComponentIsExternal) {
      clearTimeout(this.timeOut);
      const timeOut_ = 300;

      if (String(value.length) >= 3) {
        this.timeOut = setTimeout(async () => {
          await this.onChangeExternal(value);
        }, timeOut_);
      } else {
        this.setState({
          options: [],
        });
      }
    } else {
      this.filterOptions(value);
    }
  };

  filterOptions = (value) => {
    const { allOptions, valueSelect } = this.state;
    const { onChange } = this.props;
    let newOptions = [];
    newOptions = allOptions.filter((option) => {
      return option.keys.find((key) => {
        const valueOfKey = String(Object.values(key)[0]);

        const stringsIsRelational = this.isRelationBetweenTwoStrings(valueOfKey, value);

        return stringsIsRelational && valueOfKey;
      });
    });

    if (newOptions.length === 0 && valueSelect.length === 0) {
      newOptions = allOptions;
    }

    this.setState({
      openOptions: true,
      noOptions: newOptions.length === 0 && value === '' ? true : false,
      options: newOptions,
    });

    if (onChange !== undefined) {
      onChange(newOptions);
    }

    return newOptions;
  };

  onClickItemOption = (value, selectItem) => {
    const { onSelect } = this.props;

    const valueToSend = this.handlePrepareObjectToSend(value);

    selectItem && onSelect(valueToSend);

    this.setState({
      itemSelected: value.label,
      valueSelect: value.label,
      openOptions: false,
      focused: false,
      value: value.label,
    });
  };

  deleteOptionsSelected = async (focused) => {
    this.setState({
      itemSelected: '',
      valueSelect: '',
      focused: false,
    });
  };

  render() {
    const { openOptions, itemSelected, focused, options, valueSelect } = this.state;
    const { colorPrimary, onDelete, loading, inputName, fixBrokenMenu } = this.props;
    const widthContent = this.refContentInput?.current?.clientWidth;

    return (
      <Container enableDivSuper={openOptions}>
        <ContentInput focused={focused} id={inputName ? inputName : "contentInput"} ref={this.refContentInput}>
          <Autocomplete
            menuStyle={{
              width: widthContent + 'px',
              zIndex: 10,
              borderRadius: '3px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              position: fixBrokenMenu ? undefined : 'fixed',
              overflow: fixBrokenMenu ? undefined : 'auto',
              maxHeight: '50%',
            }}
            inputProps={{ disabled: itemSelected ? true : false }}
            getItemValue={(item) => item.label}
            items={options}
            renderItem={(item, isHighlighted) => (
              <EachItem isHighlighted={isHighlighted} colorPrimary={colorPrimary} key={Math.random()}>
                {capitalize(item.label, true)}
              </EachItem>
            )}
            value={valueSelect}
            onChange={(e) => {
              this.setState({
                valueSelect: e.target.value,
              });
              this.onChange(e);
            }}
            onSelect={(val, item) => {
              this.setState(
                {
                  itemSelected: val,
                },
                () => this.onClickItemOption(item, true)
              );
            }}
            
          />

          {valueSelect.length > 0 && !loading ? (
            <DivDetalhe>
              <button
                onClick={async () => {
                  await this.deleteOptionsSelected(true);

                  this.handleOptions();

                  await onDelete({});
                }}
                className="saib-button is-primary "
              >
                <Icon>close</Icon>
              </button>
            </DivDetalhe>
          ) : loading ? (
            <ContentLoading loading={loading.toString()}>
              <Icon tiny>autorenew</Icon>
            </ContentLoading>
          ) : (
            <></>
          )}
        </ContentInput>
      </Container>
    );
  }
}
