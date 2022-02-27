import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { parse } from 'rss-to-json'

export default function App() {

  const [data, setData] = useState({})
  const [items, setItems] = useState([])
  const [item, setItem] = useState({ content: null, picture: null })

  const [isLoading, setIsLoading] = useState(true)
  const [isSingleLoading, setIsSingleLoading] = useState(true)

  useEffect(async () => {
    await parse("https://lenta.ru/rss").then(res => {
      setData(res)
      let arr = []
      let length = 0
      res.items.map(y => {
        if (length <= 20) {
          arr.push(y)
          length++
        }
      })
      setItems(arr)
    }).finally(() => setIsLoading(false))
  }, [])

  const result = useMemo(() => {
    if (isLoading) {
      return <Text>Загрузка</Text>
    }
    return (
      items.map(y =>
        <TouchableOpacity key={y?.id} style={styles.block} onPress={() => { setIsSingleLoading(true); setItem({ content: y, picture: y?.enclosures[0]?.url }) }}>
          <Image source={{ uri: y?.enclosures[0]?.url }} style={{ width: '100%', height: 100 }} />
          <View style={styles.info}>
            <Text>{y?.title}</Text>
            <Text style={styles.author}>{y?.category}</Text>
          </View>
        </TouchableOpacity>
      )
    )
  }, [items, isLoading])

  const singleNews = useMemo(() => {
    console.log(item?.content?.link)
    if (isSingleLoading) {
      setTimeout(() => {
        setIsSingleLoading(false)
      }, 100)
      return (
        <View>
          <Text>Загрузка</Text>
        </View>
      )
    }
    return (
      <View onStartShouldSetResponder={() => setItem(null)} style={styles.activeItem}>
        <View style={styles.innerActiveItem} onStartShouldSetResponder={(event) => true} onTouchEnd={(e) => e.stopPropagation()}>
          <Image source={{ uri: item?.content?.enclosures[0].url }} style={{ width: '100%', height: 200 }} />
          <ScrollView style={styles.content}>
            <Text style={styles.innerTitle}>{item?.content?.title}</Text>
            <Text>{item?.content?.description}</Text>
            <TouchableOpacity style={styles.buttonUrl} onPress={async () => {
              if (await Linking.canOpenURL(item?.content?.link)) {
                await Linking.openURL(item?.content?.link)
              }
            }}>
              <Text style={styles.innerButtonUrl}>Открыть</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    )
  }, [item, isSingleLoading])

  return (
    <View style={styles.container}>
      {item?.content ? singleNews : <View></View>}
      <View>
        <Text>{data?.title}</Text>
        <Text>{data?.description}</Text>
        <StatusBar style="auto" />
      </View>
      <View style={styles.wrapper}>
        <ScrollView style={styles.innerWrapper}>
          {result}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapper: {
    width: '90%',
    height: '90%',

  },
  block: {
    width: '100%',
    height: 200,
    marginBottom: 10,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',

    backgroundColor: 'white',

    borderRadius: 10,
    overflow: "hidden",
  },
  author: {
    fontSize: 12,
    color: 'grey',
  },
  info: {
    marginTop: 20,
  },
  activeItem: {
    width: '100%',
    height: '100%',

    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,

    backgroundColor: 'rgba(52, 52, 52, 0.8)',

    display: "flex",
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerActiveItem: {
    width: "80%",
    height: "70%",

    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  innerTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  content: {
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'flex-start',
    // justifyContent: 'flex-start',
    padding: 10
  },
  buttonUrl: {
    marginTop: 15,

    paddingHorizontal: 10,
    paddingVertical: 17,

    backgroundColor: '#282936',

    marginBottom: 30,
  },
  innerButtonUrl: {
    color: 'white',
  }
});
