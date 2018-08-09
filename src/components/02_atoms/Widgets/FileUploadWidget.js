import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';

import WidgetPropTypes from '../../05_pages/NodeForm/WidgetPropTypes';
import FileUpload from '../FileUpload/FileUpload';

const CardWrapper = styled('div')`
  margin-top: 15px;
`;

const Element = styled('div')`
  > div {
    width: 100%;
  }

  legend {
    margin-bottom: 10px;
  }

  .remove {
    margin-left: auto;
  }
`;

const Image = styled('div')`
  > img {
    max-width: 100px;
    margin-right: 20px;
  }
`;

const FileUploadWidget = ({
  value,
  label,
  bundle,
  onChange,
  fieldName,
  inputProps,
  entityTypeId,
  schema: { properties, maxItems },
}) => {
  // If array then allow for multiple uploads.
  const multiple = properties.data.type === 'array';
  // Filter out empty values and (if array) object-ize array for ease of selection.
  const filteredData = multiple === true && value.data.length > 0
    ? (
      value.data
      //.filter(([, value2]) => value2.file && value2.file.id)
        .reduce(
          (agg, obj) => ({
            ...agg,
            [obj.id]: obj,
          }),
          {},
        )
      )
    : (
      Object.entries(value.data)
      //.filter(([, value2]) => value2..id)
        .reduce(
          (agg, obj) => ({
            ...agg,
            [obj.id]: obj,
          }),
          {},
        )
      );
  const length =
    (value && filteredData && Object.keys(filteredData).length) || 0;
  // maxItems is only set if array, so set to 1 as default.
  const maxItemsCount = multiple ? maxItems || 100000000000 : 1;
  if (filteredData) {
    console.log(filteredData);
  }

  return (
    <FormControl margin="normal">
      <Element>
        <FormLabel component="legend">{label}</FormLabel>
        <div
          style={{
            display:
              (!multiple && length) || length === maxItemsCount
                ? 'none'
                : 'block',
          }}
        >
          <FileUpload
            bundle={bundle}
            multiple={multiple}
            fieldName={fieldName}
            inputProps={inputProps}
            entityTypeId={entityTypeId}
            remainingUploads={maxItemsCount - length}
            onFileUpload={files => {
              const dataSchematized = files.map((file) => {
                return {
                  type: 'file--file',
                  url: file.url[0].value,
                  id: file.uuid[0].value,
                  filename: file.filename[0].value,
                  meta: { alt: '' },
                };
              });
              const data =
                multiple === true ? dataSchematized : dataSchematized[0];

              onChange({
                data: data,
              });
            }}
          />
        </div>

        {length > 0 && (
          <CardWrapper>
            <Card>
              <CardContent>
                <List>
                  {
                    Object.keys(filteredData).map((key, index) => {
                    const {
                      meta: { alt },
                      url,
                      filename,
                    } = filteredData[key];
                    const last = Object.keys(value.data).length - 1 === index;

                    return (
                      <Fragment key={key}>
                        <ListItem>
                          <Image>
                            <img
                              alt={alt || filename}
                              src={`${
                                process.env.REACT_APP_DRUPAL_BASE_URL
                              }${url}`}
                            />
                          </Image>
                          <TextField
                            required
                            value={alt}
                            margin="normal"
                            label="Alternative text"
                            onChange={event =>
                              onChange({
                                data: {
                                  ...value.data,
                                  [key]: {
                                    ...value.data[key],
                                    meta: {
                                      alt: event.target.value,
                                    },
                                  },
                                },
                              })
                            }
                          />
                          <Button
                            mini
                            id={key}
                            variant="fab"
                            color="secondary"
                            className="remove"
                            aria-label="Remove Image"
                            onClick={event => {
                              const {
                                data: {
                                  [event.currentTarget.id]: remove,
                                  ...data
                                },
                              } = value;
                              onChange({
                                data,
                              });
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        </ListItem>
                        {!last && <Divider />}
                      </Fragment>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </CardWrapper>
        )}
      </Element>
    </FormControl>
  );
};

FileUploadWidget.propTypes = {
  ...WidgetPropTypes,
  value: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  inputProps: PropTypes.shape({
    file_extensions: PropTypes.string,
    max_filesize: PropTypes.string,
  }),
  schema: PropTypes.shape({
    maxItems: PropTypes.number,
    properties: PropTypes.shape({
      data: PropTypes.shape({
        type: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};

FileUploadWidget.defaultProps = {
  value: {},
  inputProps: {
    file_extensions: 'png gif jpg jpeg',
    max_filesize: '2000000',
  },
};

export default FileUploadWidget;
