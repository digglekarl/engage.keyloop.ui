import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, ScrollView, StyleSheet, Button, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { TouchableHighlight } from 'react-native-gesture-handler';

export default function OrderingScreen() {
  const renderBrandItem = brandItem => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{brandItem.label}</Text>
        {brandItem.value === brand}
      </View>
    );
  };

  const renderPartCodeItem = partCodeItem => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{partCodeItem.label}</Text>
        {partCodeItem.value === partCode}
      </View>
    );
  };

  const renderQuantityItem = quantityItem => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{quantityItem.label}</Text>
        {quantityItem.value === quantity}
      </View>
    );
  };

  const quantityData = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
  ];

  const [jobNumber, onJobChangeText] = React.useState('Job Number or VRN');
  const [searchCode, onPartCodeChangeText] = React.useState('Part Code');

  const [brandData, setBrandData] = useState([]);
  const [brand, setBrand] = useState(null);

  const [partData, setPartData] = useState([]);
  const [partCode, setPartCode] = useState(null);
  const [partDetails, setPartDetails] = useState(null);


  const [quantity, setQuantity] = useState(null);

  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function getBrands() {
      axios.get('http://192.168.1.144:5023/api/Brand')
        .then(response => {
          if (response.data) {
            const brands = [];
            response.data.brands.map((val: any, index: number) => {
              brands.push({ 'label': `${val.description} (${val.brandCode})`, 'value': val.brandCode });
            });

            setBrandData(brands);
          }
          else {
            console.log('No brand data found');
          }
        })
        .catch(error => {
          console.error('error', error);
        });
    }
    getBrands();
  }, []);

  async function findParts() {
    axios({
      method: 'post',
      url: 'http://192.168.1.144:5023/api/Parts',
      data: {
        brandCode: brand,
        partCode: searchCode
      }
    }).then(response => {
      if (response.data) {
        console.log(response.data);
        const parts = [];
        parts.push({ 'label': `${response.data.part.partId}`, 'value': response.data.part.partId });

        setPartData(parts);
      }
      else {
        console.log('No part data found');
      }
    })
      .catch(error => {
        console.error('error', error);
      });
  }

  async function getPartDetails(partCode: String) {
    console.log(`getting part details for ${partCode}`);

    axios({
      method: 'get',
      url: `http://192.168.1.144:5023/api/Parts/${partCode}`
    }).then(response => {
      if (response.data) {
        setPartDetails(response.data.partDetail);
      }
      else {
        console.log('No part details found');
      }
    })
      .catch(error => {
        console.error('error', error);
      });
  }

  async function addToOrder() {
    setOrder({ partCode: partCode, qty: quantity, total: partDetails.listPrice.netValue * quantity })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <Text style={styles.text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sagittis erat a egestas tempor.</Text>
        </View>
        <View
          style={{
            borderBottomColor: 'white',
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        />
        <View>
          <Text style={styles.text}>
            Order Reference
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={onJobChangeText}
            placeholder='Job Number or VRN'
            value={jobNumber}
          />
        </View>
        <View
          style={{
            borderBottomColor: 'white',
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        />
        <View>
          <Text style={styles.header}>Search for a Part</Text>
        </View>
        {brandData.length > 0 && <View>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={brandData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Brand Listing"
            searchPlaceholder="Search..."
            value={brand}
            onChange={item => {
              setBrand(item.value);
            }}
            renderItem={renderBrandItem}
          />
        </View>}

        <View >
          <View>
            <TextInput style={styles.textInput}
              onChangeText={onPartCodeChangeText}
              placeholder='Part Code'
              value={searchCode}></TextInput>
            <Pressable style={styles.searchButton} onPress={() => findParts()}>
              <Text style={styles.buttonText}>Search</Text>
            </Pressable>
          </View>
        </View>

        {
          partData.length > 0 &&
          <View>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={partData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Part Listing"
              searchPlaceholder="Search..."
              value={partCode}
              onChange={(item) => getPartDetails(item.value)}
              //  onChange={item => {
              //    setPartCode(item.value);
              //  }}
              renderItem={renderPartCodeItem}
            />
          </View>
        }

        {partDetails &&
          <View>
            <View style={styles.textView}>
              <Text style={styles.text}>
                Part Code: {partDetails.partId}
              </Text>
              <Text style={styles.text}>
                Description: {partDetails.description}
              </Text>
              <Text style={styles.text}>
                Available Stock: {partDetails.unitOfSale}
              </Text>
              <Text style={styles.text}>
                Net Price (£) {partDetails.listPrice.netValue}
              </Text>
            </View>

            <View style={{ flex: 2 }}>
              <View>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={quantityData}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={item => {
                    setQuantity(item.value);
                  }}
                  renderItem={renderQuantityItem}
                />
              </View>
              <View>
                <Button title='Add' onPress={() => addToOrder()}></Button>
              </View>
            </View>
          </View>
        }

        <View
          style={{
            borderBottomColor: 'white',
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        />

        {partDetails && order &&
          <View>
            <View>
              <Text style={styles.header}>Your Order</Text>
            </View>
            <View style={styles.textView}>
              <Text style={styles.text}>
                Order lines
              </Text>
              <Text style={styles.text}>
                F2130418 Qty 2 £232.14
              </Text>
            </View>
            <View>
              <Button title='Place Order'></Button>
            </View>
          </View>
        }
      </ScrollView >
    </SafeAreaView >

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  text: {
    color: '#fff',
  },
  header: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center'
  },
  textInput: {
    margin: 16,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  textView: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#fff',
    margin: 10,
    padding: 10,
    color: '#fff'
  },
  searchButton: {
    position: 'absolute',
    right: 30,
    top: 30
  },
  buttonText: {
    textDecorationLine: 'underline'
  }
});
