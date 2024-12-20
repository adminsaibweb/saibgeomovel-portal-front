import React, { Component } from 'react';

// EXEMPLO DE USO
// <SaibRadioGroup
// valueItems={'0,1'}
// classNameItems={'"class01","class02"'}
// textItems={
//   '"Em TODOS os produtos na venda","SOMENTE produtos da lista que estiverem na venda"'
// }
// idItems={'"idAplicaDescontoEm1", "idAplicaDescontoEm2"'}
// classNameRadio="aplicarVoucherSe"
// flexDirectionRadio="row"
// alignItemsRadio="center"
// disabledRadio="true"
// captionRadio="Aplicar % desconto:"
// defaultCheckedId={
//   aplicaDescontoEm === 0
//     ? 'idAplicaDescontoEm1'
//     : aplicaDescontoEm === 1
//     ? 'idAplicaDescontoEm2'
//     : ''
// }
// />

class SaibRadioGroup extends Component {
  state = {
    itemsValue: {},
    itemsName: {},
    itemsClassName: {},
    itemsId: {},
    items: [],
    captionRadio: '',
    flexDirectionRadio: 'row',
    alignItemsRadio: 'center',
    classNameRadio: 'saibRadioGroup',
    nameComponent: 'saibItem_',
    defaultCheckedId: 'none',
    disabledRadio: false,
    multiSelect: false,
  };

  componentDidMount = () => {
    let {
      items,
      captionRadio,
      flexDirectionRadio,
      classNameRadio,
      nameComponent,
      defaultCheckedId,
      disabledRadio,
      alignItemsRadio,
      multiSelect,
    } = this.state;
    if (
      this.props.valueItems === undefined ||
      this.props.valueItems === '' ||
      this.props.classNameItems === undefined ||
      this.props.classNameItems === '' ||
      this.props.idItems === undefined ||
      this.props.idItems === '' ||
      this.props.textItems === undefined ||
      this.props.textItems === ''
    ) {
      throw new Error('As propriedades: [valueItem, classNameItems, textitems] são obrigatórias.');
    } else {
      let _valueItems = '{"value":[' + this.props.valueItems.toString() + ']}';
      let _classNameItems = '{"className":[' + this.props.classNameItems.toString() + ']}';
      let _textItems = '{"text":[' + this.props.textItems.toString() + ']}';
      let _idItems = '{"id":[' + this.props.idItems.toString() + ']}';
      // //console.log(_valueItems);
      // //console.log(_classNameItems);
      // //console.log(_textItems);
      // //console.log(_idItems);
      let valueItems = JSON.parse(_valueItems);
      let classNameItems = JSON.parse(_classNameItems);
      let textItems = JSON.parse(_textItems);
      let idItems = JSON.parse(_idItems);

      // //console.log('this.props');
      // //console.log(this.props);
      if (
        valueItems.value.length !== classNameItems.className.length ||
        valueItems.value.length !== textItems.text.length ||
        valueItems.value.length !== idItems.id.length ||
        classNameItems.className.length !== textItems.text.length ||
        classNameItems.className.length !== idItems.id.length ||
        valueItems.value.length !== textItems.text.length
      ) {
        throw new Error(
          'Verifique as propriedades: [valueItem, classNameItems, textItems, idItems] uma delas está com o número de elementos incoerente.'
        );
      }

      items = [];

      for (let index = 0; index < valueItems.value.length; index++) {
        const element = valueItems.value[index];
        let item = {};
        item.value = element;
        item.id = idItems.id[index];
        item.className = classNameItems.className[index];
        item.text = textItems.text[index];
        items.push(item);
      }
      // //console.log('items');
      // //console.log(items);
      // //console.log('this.props');
      // //console.log(this.props);

      defaultCheckedId = this.props.defaultCheckedId !== undefined ? this.props.defaultCheckedId : defaultCheckedId;
      nameComponent = 'saibItem_' + Math.floor(Math.random() * 2000).toString();
      flexDirectionRadio =
        this.props.flexDirectionRadio !== undefined ? this.props.flexDirectionRadio : flexDirectionRadio;
      alignItemsRadio = this.props.alignItemsRadio !== undefined ? this.props.alignItemsRadio : alignItemsRadio;
      classNameRadio = this.props.classNameRadio !== undefined ? this.props.classNameRadio : classNameRadio;
      captionRadio = this.props.captionRadio !== undefined ? this.props.captionRadio : captionRadio;
      disabledRadio =
        this.props.disabledRadio !== undefined && this.props.disabledRadio === 'true' ? true : disabledRadio;
      multiSelect = this.props.multiSelect !== undefined && this.props.multiSelect === 'true' ? true : multiSelect;

      const interval = setInterval(() => {
        this.handleDefaultCheck();
      }, 100);

      this.setState({
        interval,
        items,
        captionRadio,
        flexDirectionRadio,
        classNameRadio,
        nameComponent,
        defaultCheckedId,
        disabledRadio,
        alignItemsRadio,
        multiSelect,
      });
    }
  };

  handleDefaultCheck = () => {
    const { defaultCheckedId, interval } = this.state;
    // //console.log('defaultCheckedId');
    // //console.log(defaultCheckedId);
    if (
      defaultCheckedId !== 'none' &&
      defaultCheckedId !== undefined &&
      defaultCheckedId !== '' &&
      defaultCheckedId != null
    ) {
      let elementToCheck = document.getElementById(defaultCheckedId);
      // //console.log('elementToCheck');
      // //console.log(elementToCheck);
      if (elementToCheck !== undefined && elementToCheck != null) {
        elementToCheck.checked = true;
      }
    }
    clearInterval(interval);
  };

  localOnClickChange = (e) => {
    if (e.target.id === undefined || e.target.id === '') {
      return;
    }
    // e.preventDefault();
    // //console.log(e.target.name);
    let { items, multiSelect } = this.state;
    let _id = String(e.target.id);
    _id = _id.substr(_id.indexOf('_') + 1, _id.length);
    const clickedItem = _id;
    const itemValue = items.find((_item) => _item.id === clickedItem).value;
    // //console.log('localOnClickChange');
    // //console.log(clickedItem);
    if (!multiSelect) {
      for (const item of items) {
        document.getElementById(item.id).checked = item.id !== clickedItem ? false : true;
      }
    }
    this.props.onChange(itemValue);
  };

  render() {
    const { items, classNameRadio, captionRadio, flexDirectionRadio, nameComponent, disabledRadio, alignItemsRadio } =
      this.state;
    return (
      <div
        className={classNameRadio}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          paddingRight: 'unset',
          alignItems: alignItemsRadio,
          // justifyContent: 'space-around',
          height: '100%',
          ...this.props.style
        }}
      >
        {captionRadio !== undefined && captionRadio !== '' ? (
          <p className={'title' + classNameRadio}>{captionRadio}</p>
        ) : (
          <></>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: flexDirectionRadio,
            flexWrap: 'wrap',
            padding: '10px',
          }}
          className={'box' + classNameRadio}
        >
          {items.map((item) => (
            <div
              key={item.value}
              className={'box' + item.className}
              onClick={!this.props.readOnly ? this.localOnClickChange : () => {}}
              id={'div_' + item.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                // marginTop: '10px',
                alignItems: alignItemsRadio,
                cursor: 'pointer',
              }}
            >
              <input
                name={nameComponent}
                type="checkbox"
                className={item.className + ' itens' + classNameRadio}
                id={item.id}
                disabled={disabledRadio}
                value={item.value}
                style={{
                  cursor: 'pointer',
                  position: 'unset',
                  opacity: '1',
                  transform: 'scale(1.5)',
                  filter: 'grayscale(59%) hue-rotate(63deg)',
                }}
              />
              <label
                // htmlFor={item.id}
                id={'label_' + item.id}
                // onClick={this.localOnClickChange}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#858585',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  marginRight: flexDirectionRadio === 'row' ? '10px' : '0px',
                }}
              >
                {' '}
                {item.text}{' '}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

// Alterações no designer do box filter

export default SaibRadioGroup;
