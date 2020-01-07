import _ from 'lodash';

interface Props {
  value: any;
  onChange: (value: any, field: string) => any;
}

const innerNestValue = (childField: string, props: Props) => {
  const { value: parentValue } = props;
  const childValue = _.get(parentValue, childField);
  return {
    value: childValue,
  };
};

const innerNestChange = (childField: string, props: Props) => {
  const { value: parentValue, onChange } = props;
  const newOnChange = (childValue: any) => {
    onChange({
      ...parentValue,
      [childField]: childValue,
    }, childField);
  };
  return {
    onChange: newOnChange,
  };
};

const innerNestSelect = (childField: string, props: Props) => {
  const { value: parentValue, onChange } = props;
  const childValue = _.get(parentValue, childField);
  const onItemOfChildSelect = (childItemToAdd: any) => {
    onChange({
      ...parentValue,
      [childField]: _.concat(childValue, childItemToAdd),
    }, childField);
  };
  return {
    onSelect: onItemOfChildSelect,
  };
};

const innerNestDeselect = (childField: string, props: Props) => {
  const { value: parentValue, onChange } = props;
  const childValue = _.get(parentValue, childField);
  const onItemOfChildDeselect = (childItemValueToRemove: any) => {
    onChange({
      ...parentValue,
      [childField]: childValue.filter((childItemValue: any) => childItemValue !== childItemValueToRemove),
    }, childField);
  };
  return {
    onDeselect: onItemOfChildDeselect,
  };
};

export type Nest = (props: Props) => any;

// onChange and (onSelect, onDeselect) pair should not come together, or the events will be messed up
export const nestBasic = (childField: string): Nest => {
  return (props: Props) => ({
    ...props,
    ...innerNestValue(childField, props),
    ...innerNestChange(childField, props),
  });
};

export const nestSelect = (childField: string): Nest => {
  return (props: Props) => ({
    ...props,
    ...innerNestSelect(childField, props),
    ...innerNestDeselect(childField, props),
  });
};

export const combineNest = (n1: Nest, n2: Nest): Nest => {
  return (props: Props) => ({
    ...props,
    ...n1(props),
    ...n2(props),
  });
};
